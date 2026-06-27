import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router";
import { UI } from "../../theme/theme";
import {
  cancelChargingSession,
  completeChargingSession,
  startChargingSession,
} from "../../api/charging";
import {
  fetchActiveTicketForStation,
  requestChargingTicket,
} from "../../api/tickets";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import { haversineKm } from "../../utils/distance";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout, setCars } from "../../features/auth/authSlice";
import { clearAuthStorage, persistCarsToStorage } from "../Profile/profileStorage";
import {
  PAYMENT_METHODS,
  REPORT_ISSUE_TYPES,
  TICKET_KWH,
  TOTAL_CHARGE_MINUTES,
} from "./constants";
import { getTicketPriceLabel } from "./utils";
import type { ChargingStatus, Station, Ticket } from "./types";
import type { ChargingSpeed, ConnectorType } from "../../models/model";
import StationOverviewSection from "./components/StationOverviewSection";
import ConnectorsSection from "./components/ConnectorsSection";
import AmenitiesSection from "./components/AmenitiesSection";
import ActionsCard from "./components/ActionsCard";
import PricingSection from "./components/PricingSection";
import CoordinatesSection from "./components/CoordinatesSection";
import PaymentDialog, {
  type PaymentDialogState,
  type PaymentPricing,
  type PaymentSelection,
  type PaymentTicketConfig,
} from "./components/PaymentDialog";
import ChargingDialog, {
  type ChargingDialogState,
  type ChargingProgressData,
} from "./components/ChargingDialog";
import ReportDialog from "./components/ReportDialog";
import ShareDialog from "./components/ShareDialog";
import { checkSessionStatus } from "../../utils/session";
import StartChargingDialog from "./components/StartChargingDialog";
import {
  buildChargingSocketUrl,
  buildTicketFromServer,
  isVehicleCharging,
  toChargingSpeed,
  toCleanString,
  toDateMs,
  toProgressPercent,
} from "./parsing";
import { useStationData } from "./hooks/useStationData";
import { useReportShare } from "./hooks/useReportShare";
import { useStartChargingSelection } from "./hooks/useStartChargingSelection";

/**
 * ChargeFinder - Station Detail Page (Canvas-safe) - LIGHT MODE
 *
 * Canvas notes:
 * - No react-router required.
 * - No Leaflet.
 * - Uses safe browser-only actions.
 */

export default function StationDetailPage() {
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  const { id: stationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);

  // Demo selector for canvas. In your app, stationId will come from route params.
  //   const [stationId, setStationId] = useState("st-001");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    PAYMENT_METHODS[0].id
  );
  const [chargingSpeed, setChargingSpeed] = useState<ChargingSpeed>("NORMAL");
  const [ticketKwhInput, setTicketKwhInput] = useState("");
  const [ticketKwhTouched, setTicketKwhTouched] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketRequestError, setTicketRequestError] = useState<string | null>(
    null
  );
  const [ticketErrorToast, setTicketErrorToast] = useState<string | null>(null);
  const [ticketRequestLoading, setTicketRequestLoading] = useState(false);
  const [chargingOpen, setChargingOpen] = useState(false);
  const [chargingProgress, setChargingProgress] = useState(0);
  const [chargingStatus, setChargingStatus] = useState<ChargingStatus>("idle");
  const [chargingCancelled, setChargingCancelled] = useState(false);
  const [chargingRequestLoading, setChargingRequestLoading] = useState(false);
  const [chargingRequestError, setChargingRequestError] = useState<
    string | null
  >(null);
  const [chargingBatteryPercent, setChargingBatteryPercent] = useState<
    number | null
  >(null);
  const [estimatedCompletionAt, setEstimatedCompletionAt] = useState<
    number | null
  >(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const chargingCompleteRequested = useRef(false);
  const chargingVehicleIdRef = useRef<string | null>(null);

  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };

  const { loading, station, loadError, refreshStation } =
    useStationData(stationId);

  const {
    reportOpen,
    setReportOpen,
    shareOpen,
    setShareOpen,
    reportType,
    setReportType,
    reportNote,
    setReportNote,
    openGoogleMaps,
    submitReport,
  } = useReportShare(station);

  const selectedPayment = useMemo(
    () =>
      PAYMENT_METHODS.find((method) => method.id === selectedPaymentId) ??
      PAYMENT_METHODS[0],
    [selectedPaymentId]
  );

  const remainingMinutes = Math.max(
    0,
    Math.ceil(((100 - chargingProgress) / 100) * TOTAL_CHARGE_MINUTES)
  );
  const displayChargingPercent = useMemo(
    () => chargingBatteryPercent ?? chargingProgress,
    [chargingBatteryPercent, chargingProgress]
  );
  const estimatedRemainingMinutes = useMemo(() => {
    if (!estimatedCompletionAt) return null;
    const diffMs = estimatedCompletionAt - Date.now();
    if (!Number.isFinite(diffMs)) return null;
    return Math.max(0, Math.ceil(diffMs / 60000));
  }, [chargingProgress, chargingStatus, estimatedCompletionAt]);

  const distanceKm = useMemo(() => {
    if (!station) return null;
    return haversineKm(userCenter, { lat: station.lat, lng: station.lng });
  }, [station, userCenter]);

  const activeCar = useMemo(
    () => cars.find((c) => c.id === activeCarId) ?? null,
    [cars, activeCarId]
  );
  const activeCarBatteryCapacity = Number.isFinite(activeCar?.batteryCapacity)
    ? Number(activeCar?.batteryCapacity)
    : null;
  const activeCarBatteryPercent = Number.isFinite(activeCar?.batteryPercent)
    ? Number(activeCar?.batteryPercent)
    : null;
  const activeStationId = station?.id ?? null;
  const hasAvailableVehicles = useMemo(
    () => cars.some((car) => !isVehicleCharging(car)),
    [cars]
  );

  const {
    startChargingOpen,
    setStartChargingOpen,
    selectedConnectorType,
    setSelectedConnectorType,
    selectedVehicleId,
    setSelectedVehicleId,
    preferredConnectorType,
    availableConnectorTypes,
  } = useStartChargingSelection({ station, activeCar, cars, activeCarId });

  const isCompatible = useMemo(() => {
    if (!activeCar || !station || !activeCar.connectorTypes.length) return null;
    return station.connectors.some((c) =>
      activeCar.connectorTypes.includes(c.type)
    );
  }, [activeCar, station]);

  const effectiveBatteryPercent = useMemo(() => {
    if (Number.isFinite(chargingBatteryPercent)) {
      return Math.min(100, Math.max(0, Number(chargingBatteryPercent)));
    }
    if (Number.isFinite(activeCarBatteryPercent)) {
      return Math.min(100, Math.max(0, Number(activeCarBatteryPercent)));
    }
    return null;
  }, [chargingBatteryPercent, activeCarBatteryPercent]);

  const defaultTicketKwh = useMemo(() => {
    if (!Number.isFinite(activeCarBatteryCapacity)) return TICKET_KWH;
    if (activeCarBatteryCapacity == null) return TICKET_KWH;
    if (effectiveBatteryPercent == null) return TICKET_KWH;
    const remainingKwh =
      ((100 - effectiveBatteryPercent) / 100) * activeCarBatteryCapacity;
    if (!Number.isFinite(remainingKwh)) return TICKET_KWH;
    return Math.max(1, Math.round(remainingKwh * 10) / 10);
  }, [activeCarBatteryCapacity, effectiveBatteryPercent]);

  const parsedTicketKwh = useMemo(() => {
    const trimmed = ticketKwhInput.trim();
    if (!trimmed) return null;
    const value = Number(trimmed);
    return Number.isFinite(value) ? value : null;
  }, [ticketKwhInput]);
  const hasTicketKwhInput = ticketKwhInput.trim().length > 0;
  const isTicketKwhValid =
    !hasTicketKwhInput || (parsedTicketKwh != null && parsedTicketKwh > 0);

  const ticketKwh = useMemo(() => {
    if (parsedTicketKwh != null && parsedTicketKwh > 0) {
      return parsedTicketKwh;
    }
    return defaultTicketKwh;
  }, [parsedTicketKwh, defaultTicketKwh]);

  const ticketPricePerKwh = useMemo(() => {
    if (!station) return null;
    const base = Number.isFinite(station.pricing?.perKwh)
      ? station.pricing.perKwh
      : null;
    const fast = Number.isFinite(station.pricing?.fastPerKwh)
      ? station.pricing.fastPerKwh
      : null;
    const ultra = Number.isFinite(station.pricing?.ultraFastPerKwh)
      ? station.pricing.ultraFastPerKwh
      : null;
    if (chargingSpeed === "FAST") {
      return fast ?? base;
    }
    if (chargingSpeed === "ULTRA_FAST") {
      return ultra ?? fast ?? base;
    }
    return base;
  }, [chargingSpeed, station]);

  useEffect(() => {
    if (ticketKwhTouched) return;
    if (!Number.isFinite(defaultTicketKwh)) return;
    setTicketKwhInput(String(defaultTicketKwh));
  }, [defaultTicketKwh, ticketKwhTouched]);

  const ticketPriceLabel = getTicketPriceLabel(
    station,
    ticketKwh,
    ticketPricePerKwh
  );
  const ticketPriceLabelRef = useRef(ticketPriceLabel);
  useEffect(() => {
    ticketPriceLabelRef.current = ticketPriceLabel;
  }, [ticketPriceLabel]);
  const deliveredKwh =
    Math.round(((ticketKwh * chargingProgress) / 100) * 10) / 10;

  const canCharge =
    isAuthenticated &&
    station?.status === "AVAILABLE" &&
    (isCompatible ?? true) &&
    !!ticket;
  const canStartCharging = canCharge && chargingStatus !== "charging";
  const isCharging = chargingStatus === "charging";
  const chargingActionLabel =
    chargingStatus === "charging" ? "View charging" : "Start charging";
  const paymentActionLabel = !isAuthenticated
    ? "Log in to buy ticket"
    : ticket
    ? "Change payment"
    : "Buy charging ticket";

  const handleTicketKwhChange = (value: string) => {
    setTicketKwhInput(value);
    if (!ticketKwhTouched) setTicketKwhTouched(true);
  };

  const handleChargingSpeedChange = (value: ChargingSpeed) => {
    setChargingSpeed(value);
  };

  useEffect(() => {
    if (!activeStationId || !isAuthenticated) return;
    const controller = new AbortController();
    let active = true;

    const loadActiveTicket = async () => {
      const result = await fetchActiveTicketForStation(
        activeStationId,
        controller.signal
      );
      if (!active) return;
      if (!result.ok) return;

      if (!result.ticket) {
        setTicket(null);
        return;
      }

      const payload =
        result.ticket && typeof result.ticket === "object"
          ? (result.ticket as Record<string, unknown>)
          : {};

      const speedFromTicket =
        toChargingSpeed(payload.chargingSpeed) ??
        toChargingSpeed(payload.charging_speed) ??
        null;
      if (speedFromTicket) {
        setChargingSpeed(speedFromTicket);
      }

      const normalizedTicket = buildTicketFromServer(
        payload,
        ticketPriceLabelRef.current
      );
      setTicket(normalizedTicket);
      if (normalizedTicket.progressPercent != null) {
        setChargingProgress(normalizedTicket.progressPercent);
      }
      if (normalizedTicket.chargingStatus) {
        setChargingStatus(normalizedTicket.chargingStatus);
      }
    };

    loadActiveTicket();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeStationId, isAuthenticated]);

  // Redirects unauthenticated users to login while preserving return path.
  const handleLoginRedirect = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate(`/login?next=${next}`);
  };

  const invalidateSession = useCallback(
    (message: string | null) => {
      if (message) setSessionMessage(message);
      clearAuthStorage({ setLogoutRedirect: false });
      dispatch(logout());
    },
    [dispatch]
  );

  const ensureSessionValid = useCallback(() => {
    if (!isAuthenticated) return true;
    const result = checkSessionStatus();
    if (result.status === "valid") return true;
    invalidateSession(result.message);
    return false;
  }, [invalidateSession, isAuthenticated]);

  const getVehicleBatteryPercent = useCallback(
    (vehicleId?: string | null) => {
      const targetId = vehicleId ?? activeCarId ?? null;
      if (!targetId) return null;
      const vehicle = cars.find((car) => car.id === targetId);
      const percent = vehicle?.batteryPercent ?? null;
      return Number.isFinite(percent as number) ? Number(percent) : null;
    },
    [activeCarId, cars]
  );

  const updateVehicleChargingStatus = useCallback(
    (vehicleId: string | null, status: string | null) => {
      if (!vehicleId) return;
      if (!cars.length) return;
      const nextCars = cars.map((car) =>
        car.id === vehicleId ? { ...car, chargingStatus: status } : car
      );
      dispatch(
        setCars({
          cars: nextCars,
          activeCarId,
        })
      );
      persistCarsToStorage(nextCars, activeCarId);
    },
    [activeCarId, cars, dispatch]
  );

  // Creates a charging ticket for the selected payment method.
  const handleBuyTicket = async () => {
    if (!ensureSessionValid() || !station || !isAuthenticated) return;
    setTicketRequestError(null);
    setTicketRequestLoading(true);

    const result = await requestChargingTicket({
      stationId: station.id,
      connectorType: preferredConnectorType,
      chargingSpeed,
      ticketKwh,
    });

    if (!result.ok) {
      const fallbackMessage = ticket
        ? "Could not update payment."
        : "Could not request ticket.";
      const message = result.error || fallbackMessage;
      setTicketRequestError(message);
      setTicketErrorToast(message);
      setTicketRequestLoading(false);
      return;
    }

    const payload = result.ticket ?? {};
    const payloadRecord =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : {};
    const speedFromTicket =
      toChargingSpeed(payloadRecord.chargingSpeed) ??
      toChargingSpeed(payloadRecord.charging_speed) ??
      null;
    if (speedFromTicket) {
      setChargingSpeed(speedFromTicket);
    }
    const ticketId =
      toCleanString(payloadRecord.id ?? payloadRecord._id) ||
      `TICKET-${Date.now()}`;
    const purchasedAt =
      typeof payloadRecord.createdAt === "string"
        ? payloadRecord.createdAt
        : new Date().toISOString();

    setTicket({
      id: ticketId,
      methodId: selectedPayment.id,
      methodLabel: selectedPayment.label,
      priceLabel: ticketPriceLabel,
      purchasedAt,
    });
    setPaymentOpen(false);
    setTicketRequestLoading(false);
  };

  // Starts charging by calling the backend endpoint.
  const handleStartCharging = async (
    connectorType?: ConnectorType | null,
    vehicleId?: string | null
  ) => {
    if (!ensureSessionValid()) return;
    if (!canStartCharging || !station || chargingRequestLoading) return;
    setChargingRequestLoading(true);
    setChargingRequestError(null);
    setChargingCancelled(false);
    const initialBatteryPercent = getVehicleBatteryPercent(vehicleId);

    const result = await startChargingSession({
      stationId: station.id,
      connectorType: connectorType ?? undefined,
      vehicleId: vehicleId ?? undefined,
    });
    if (!result.ok) {
      setChargingRequestError(result.error || "Could not start charging.");
      setChargingBatteryPercent(null);
      setChargingRequestLoading(false);
      return;
    }

    if (result.ticket && typeof result.ticket === "object") {
      const ticketPayload = result.ticket as Record<string, unknown>;
      const batteryPercentFromTicket =
        toProgressPercent(ticketPayload.batteryPercentage) ??
        toProgressPercent(ticketPayload.battery_percent) ??
        null;
      const normalizedTicket = buildTicketFromServer(
        ticketPayload,
        ticketPriceLabel
      );
      setTicket(normalizedTicket);
      if (batteryPercentFromTicket != null) {
        setChargingBatteryPercent(batteryPercentFromTicket);
      } else if (initialBatteryPercent != null) {
        setChargingBatteryPercent(initialBatteryPercent);
      } else {
        setChargingBatteryPercent(null);
      }
      if (normalizedTicket.progressPercent != null) {
        setChargingProgress(normalizedTicket.progressPercent);
      } else {
        setChargingProgress(0);
      }
      if (normalizedTicket.chargingStatus) {
        setChargingStatus(normalizedTicket.chargingStatus);
      } else {
        setChargingStatus("charging");
      }
    } else {
      setChargingProgress(0);
      setChargingStatus("charging");
      if (initialBatteryPercent != null) {
        setChargingBatteryPercent(initialBatteryPercent);
      } else {
        setChargingBatteryPercent(null);
      }
    }

    if (vehicleId) {
      chargingVehicleIdRef.current = vehicleId;
      updateVehicleChargingStatus(vehicleId, "CHARGING");
    }
    chargingCompleteRequested.current = false;
    await refreshStation();
    setEstimatedCompletionAt(null);
    setChargingOpen(true);
    setChargingRequestLoading(false);
  };

  const handleChargingAction = () => {
    if (chargingStatus === "charging") {
      setChargingOpen(true);
      return;
    }
    if (!ensureSessionValid()) return;
    if (!availableConnectorTypes.length) {
      setChargingRequestError("No connectors available for this station.");
      return;
    }
    if (cars.length > 0 && !hasAvailableVehicles) {
      setChargingRequestError("All your vehicles are already charging.");
      return;
    }
    setChargingRequestError(null);
    setStartChargingOpen(true);
  };

  const handleConfirmStartCharging = async () => {
    if (!selectedConnectorType) return;
    if (cars.length > 0) {
      if (!selectedVehicleId) {
        setChargingRequestError("Select a vehicle that is not charging.");
        return;
      }
      const selectedVehicle =
        cars.find((car) => car.id === selectedVehicleId) ?? null;
      if (selectedVehicle && isVehicleCharging(selectedVehicle)) {
        setChargingRequestError("That vehicle is already charging.");
        return;
      }
    }
    setChargingRequestError(null);
    setStartChargingOpen(false);
    await handleStartCharging(selectedConnectorType, selectedVehicleId);
  };

  // Opens the payment dialog or redirects to login if needed.
  const handlePaymentOpen = () => {
    if (!ensureSessionValid()) return;
    if (isCharging) return;
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }
    setTicketRequestError(null);
    setPaymentOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentOpen(false);
    setTicketRequestError(null);
  };

  const handleCloseCharging = () => {
    setChargingOpen(false);
    if (chargingStatus === "done") {
      setChargingStatus("idle");
      setChargingProgress(0);
      setChargingCancelled(false);
    }
  };

  // Stops charging by cancelling the active session.
  const handleStopCharging = async () => {
    if (!ensureSessionValid()) return;
    if (!station || chargingRequestLoading) return;
    setChargingRequestLoading(true);
    setChargingRequestError(null);

    let result = await cancelChargingSession({ stationId: station.id });
    if (!result.ok) {
      const fallback = await completeChargingSession({
        stationId: station.id,
        cancel: true,
      });
      if (!fallback.ok) {
        setChargingRequestError(
          fallback.error || result.error || "Could not stop charging."
        );
        setChargingRequestLoading(false);
        return;
      }
      result = fallback;
    }

    if (result.ticket && typeof result.ticket === "object") {
      const ticketPayload = result.ticket as Record<string, unknown>;
      const progressFromTicket =
        toProgressPercent(ticketPayload.progressPercent) ??
        toProgressPercent(ticketPayload.progress_percent) ??
        null;
      const batteryPercentFromTicket =
        toProgressPercent(ticketPayload.batteryPercentage) ??
        toProgressPercent(ticketPayload.battery_percent) ??
        null;
      if (progressFromTicket != null) {
        setChargingProgress(progressFromTicket);
      }
      if (batteryPercentFromTicket != null) {
        setChargingBatteryPercent(batteryPercentFromTicket);
      }
    }

    chargingCompleteRequested.current = true;
    setChargingStatus("done");
    setChargingCancelled(true);
    setTicket(null);
    setEstimatedCompletionAt(null);
    await refreshStation();
    setChargingRequestLoading(false);
  };

  useEffect(() => {
    if (chargingStatus !== "done") return;
    if (!chargingVehicleIdRef.current) return;
    updateVehicleChargingStatus(chargingVehicleIdRef.current, null);
    chargingVehicleIdRef.current = null;
  }, [chargingStatus, updateVehicleChargingStatus]);

  useEffect(() => {
    if (isAuthenticated) return;
    setPaymentOpen(false);
    setTicket(null);
    setTicketRequestError(null);
    setTicketRequestLoading(false);
    setChargingOpen(false);
    setChargingProgress(0);
    setChargingStatus("idle");
    setChargingCancelled(false);
    setChargingRequestError(null);
    setChargingRequestLoading(false);
    setEstimatedCompletionAt(null);
    setChargingBatteryPercent(null);
    chargingCompleteRequested.current = false;
    chargingVehicleIdRef.current = null;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!stationId) return;
    const socketUrl = buildChargingSocketUrl(stationId);
    if (!socketUrl) return;

    const socket = new WebSocket(socketUrl);

    // Applies WebSocket payloads to charging state.
    const handleChargingPayload = (payload: Record<string, unknown>) => {
      const type = toCleanString(payload.type).toLowerCase();
      const ticketPayload =
        payload.ticket && typeof payload.ticket === "object"
          ? (payload.ticket as Record<string, unknown>)
          : null;
      const completedTicketPayload =
        payload.completedTicket && typeof payload.completedTicket === "object"
          ? (payload.completedTicket as Record<string, unknown>)
          : null;
      const cancelledTicketPayload =
        payload.cancelledTicket && typeof payload.cancelledTicket === "object"
          ? (payload.cancelledTicket as Record<string, unknown>)
          : null;
      const progressFromPayload =
        toProgressPercent(payload.progressPercent) ??
        toProgressPercent(ticketPayload?.progressPercent) ??
        toProgressPercent(completedTicketPayload?.progressPercent) ??
        toProgressPercent(cancelledTicketPayload?.progressPercent) ??
        null;
      const batteryPercentFromPayload =
        toProgressPercent(payload.batteryPercentage) ??
        toProgressPercent(payload.battery_percent) ??
        toProgressPercent(ticketPayload?.batteryPercentage) ??
        toProgressPercent(ticketPayload?.battery_percent) ??
        toProgressPercent(completedTicketPayload?.batteryPercentage) ??
        toProgressPercent(completedTicketPayload?.battery_percent) ??
        toProgressPercent(cancelledTicketPayload?.batteryPercentage) ??
        toProgressPercent(cancelledTicketPayload?.battery_percent) ??
        null;
      const estimatedCompletionMs =
        toDateMs(payload.estimatedCompletionAt) ??
        toDateMs(payload.estimateeedCompletionAt) ??
        toDateMs(payload.estimated_completion_at) ??
        toDateMs(ticketPayload?.estimatedCompletionAt) ??
        toDateMs(ticketPayload?.estimateeedCompletionAt) ??
        toDateMs(ticketPayload?.estimated_completion_at) ??
        toDateMs(cancelledTicketPayload?.estimatedCompletionAt) ??
        toDateMs(cancelledTicketPayload?.estimateeedCompletionAt) ??
        toDateMs(cancelledTicketPayload?.estimated_completion_at) ??
        null;

      if (type === "completed") {
        setChargingStatus("done");
        setChargingCancelled(false);
        setChargingProgress(progressFromPayload ?? 100);
        setTicket(null);
        setEstimatedCompletionAt(null);
        setChargingBatteryPercent(batteryPercentFromPayload ?? 100);
        chargingCompleteRequested.current = true;
        return;
      }

      if (type === "cancelled" || type === "canceled") {
        setChargingStatus("done");
        setChargingCancelled(true);
        if (progressFromPayload != null) {
          setChargingProgress(progressFromPayload);
        }
        if (batteryPercentFromPayload != null) {
          setChargingBatteryPercent(batteryPercentFromPayload);
        }
        setTicket(null);
        setEstimatedCompletionAt(null);
        chargingCompleteRequested.current = true;
        return;
      }

      if (type === "initial" && !ticketPayload) {
        setTicket(null);
        setChargingStatus("idle");
        setChargingProgress(0);
        setEstimatedCompletionAt(null);
        setChargingBatteryPercent(null);
        setChargingCancelled(false);
        chargingCompleteRequested.current = false;
        return;
      }

      if (ticketPayload) {
        const normalizedTicket = buildTicketFromServer(
          ticketPayload,
          ticketPriceLabelRef.current
        );
        setTicket(normalizedTicket);
        if (normalizedTicket.progressPercent != null) {
          setChargingProgress(normalizedTicket.progressPercent);
        }
        if (normalizedTicket.chargingStatus) {
          setChargingStatus(normalizedTicket.chargingStatus);
        }
      }

      if (progressFromPayload != null) {
        setChargingProgress(progressFromPayload);
        if (progressFromPayload >= 100) {
          setChargingStatus("done");
          setChargingCancelled(false);
          if (!chargingCompleteRequested.current) {
            chargingCompleteRequested.current = true;
            completeChargingSession({ stationId }).catch(() => {
              // ignore background completion errors
            });
          }
        }
      }

      if (batteryPercentFromPayload != null) {
        setChargingBatteryPercent(batteryPercentFromPayload);
      }

      if (estimatedCompletionMs != null) {
        setEstimatedCompletionAt(estimatedCompletionMs);
      }

      if (type === "started") {
        setChargingStatus("charging");
        setChargingCancelled(false);
        setChargingOpen(true);
        chargingCompleteRequested.current = false;
      }

      if (type === "progress" && progressFromPayload != null) {
        setChargingStatus("charging");
        setChargingCancelled(false);
      }
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown>;
        handleChargingPayload(payload);
      } catch {
        // ignore malformed WebSocket payloads
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    return () => {
      socket.close();
    };
  }, [stationId]);


  if (!loading && !station) {
    return (
      <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            maxWidth: 720,
            mx: "auto",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: 5,
              borderColor: UI.border2,
              background: UI.surface,
              boxShadow: UI.shadow,
            }}
          >
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: 22 }}>
                  Station unavailable
                </Typography>
                <Typography sx={{ color: UI.text2 }}>
                  {loadError || "We couldn't load this station right now."}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    borderColor: UI.border,
                    color: UI.text,
                    alignSelf: "flex-start",
                  }}
                >
                  Back to map
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          display: "grid",
          gap: 2,
          gridTemplateColumns: isMdUp ? "1.2fr 0.8fr" : "1fr",
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <StationOverviewSection
            loading={loading}
            station={station}
            activeCar={activeCar}
            isCompatible={isCompatible}
            distanceKm={distanceKm}
            onReportIssue={() => setReportOpen(true)}
          />
          <ConnectorsSection loading={loading} station={station} />
          <AmenitiesSection loading={loading} station={station} />
        </Stack>

        <Stack spacing={2}>
          <ActionsCard
            loading={loading}
            station={station}
            isAuthenticated={isAuthenticated}
            hasTicket={!!ticket}
            activeCar={activeCar}
            isCompatible={isCompatible}
            canCharge={canCharge}
            chargingActionLabel={chargingActionLabel}
            onChargingAction={handleChargingAction}
            onOpenMaps={openGoogleMaps}
            chargingError={chargingRequestError}
            chargingLoading={chargingRequestLoading}
          />
          <PricingSection
            loading={loading}
            station={station}
            paymentActionLabel={paymentActionLabel}
            paymentDisabled={isCharging}
            onPaymentOpen={handlePaymentOpen}
          />
          <CoordinatesSection loading={loading} station={station} />
        </Stack>
      </Box>

      <PaymentDialog
        dialogState={
          {
            open: paymentOpen && isAuthenticated,
            onClose: handleClosePayment,
            onConfirm: handleBuyTicket,
            canSubmit: !!station && isAuthenticated && isTicketKwhValid,
            hasTicket: !!ticket,
            submitError: ticketRequestError,
            isSubmitting: ticketRequestLoading,
          } satisfies PaymentDialogState
        }
        ticketConfig={
          {
            ticketKwh,
            ticketKwhInput,
            ticketKwhSuggested: defaultTicketKwh,
            ticketKwhValid: isTicketKwhValid,
            onTicketKwhChange: handleTicketKwhChange,
            chargingSpeed,
            onChargingSpeedChange: handleChargingSpeedChange,
          } satisfies PaymentTicketConfig
        }
        pricing={
          {
            pricePerKwh: ticketPricePerKwh,
            currency: station?.pricing?.currency ?? null,
            ticketPriceLabel,
          } satisfies PaymentPricing
        }
        paymentSelection={
          {
            selectedPaymentId,
            onPaymentChange: setSelectedPaymentId,
            paymentMethods: PAYMENT_METHODS,
          } satisfies PaymentSelection
        }
      />

      <ChargingDialog
        dialogState={
          {
            open: chargingOpen,
            onClose: handleCloseCharging,
            onStop: handleStopCharging,
          } satisfies ChargingDialogState
        }
        chargingProgress={
          {
            status: chargingStatus,
            cancelled: chargingCancelled,
            progress: chargingProgress,
            displayProgress: displayChargingPercent,
            ticket,
            ticketKwh,
            deliveredKwh,
            remainingMinutes,
            estimatedRemainingMinutes,
          } satisfies ChargingProgressData
        }
      />

      <StartChargingDialog
        open={startChargingOpen}
        onClose={() => setStartChargingOpen(false)}
        connectorTypes={availableConnectorTypes}
        selectedConnectorType={selectedConnectorType}
        onConnectorChange={setSelectedConnectorType}
        vehicles={cars}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        onConfirm={handleConfirmStartCharging}
        isSubmitting={chargingRequestLoading}
      />

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportType={reportType}
        reportNote={reportNote}
        onReportTypeChange={setReportType}
        onReportNoteChange={setReportNote}
        onSubmit={submitReport}
        issueTypes={REPORT_ISSUE_TYPES}
      />

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        station={station}
      />

      <Snackbar
        open={!!sessionMessage}
        autoHideDuration={4000}
        onClose={() => setSessionMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSessionMessage(null)}
          severity="warning"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {sessionMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!ticketErrorToast}
        autoHideDuration={4000}
        onClose={() => setTicketErrorToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setTicketErrorToast(null)}
          severity="error"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {ticketErrorToast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
