import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";
import { useLoaderData, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { UI } from "../../theme/theme";
import { LanguageCard } from "../../components";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  removeCar,
  setActiveCar,
  setCars,
  updateProfile,
} from "../../features/auth/authSlice";
import type { UserCar } from "../../features/auth/authSlice";
import type { ProfileLoaderData } from "./types";
import { changePasswordRequest, updateProfileRequest } from "./profileRequests";
import type {
  ChangePasswordValues,
  EditProfileValues,
} from "../../forms/schemas";
import {
  persistCarsToStorage,
  persistProfileToStorage,
} from "./profileStorage";
import { deleteVehicleRequest, setActiveVehicleRequest } from "./vehicleRequests";
import { fetchVehicleById } from "../../api/vehicles";
import { fetchChargingHistory } from "../../api/chargingHistory";
import { resolveAssetUrl } from "../../utils/assets";
import ProfileOverviewCard from "./components/ProfileOverviewCard";
import CarsCard from "./components/CarsCard";
import EditProfileDialog from "./components/EditProfileDialog";
import ChangePasswordDialog from "./components/ChangePasswordDialog";
import ChargingHistoryCard, {
  type ChargingHistoryItem,
} from "./components/ChargingHistoryCard";

export { profileAction, profileLoader } from "./profileRoute";

const CHARGING_VEHICLE_REFRESH_MS = 60000;

const toCleanString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const toProgressPercent = (value: unknown): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
};

const toDateMs = (value: unknown): number | null => {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value > 1e12 ? value : value * 1000;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
};

const normalizeVehicle = (vehicle: unknown): UserCar | null => {
  if (!vehicle || typeof vehicle !== "object") return null;
  const data = vehicle as Record<string, unknown>;
  const id =
    typeof data.id === "string"
      ? data.id.trim()
      : typeof data.id === "number"
      ? String(data.id)
      : "";
  if (!id) return null;
  const name =
    typeof data.name === "string" && data.name.trim()
      ? data.name.trim()
      : i18n.t("cars.defaultName", { ns: "profile" });
  const connectorTypes = Array.isArray(data.connector_type)
    ? (data.connector_type as UserCar["connectorTypes"])
    : [];
  const minKW = Number.isFinite(Number(data.min_power))
    ? Number(data.min_power)
    : 0;
  const batteryCapacityRaw =
    typeof data.batteryCapacity === "number"
      ? data.batteryCapacity
      : typeof data.batteryCapacity === "string"
      ? Number(data.batteryCapacity)
      : typeof data.battery_capacity === "number"
      ? data.battery_capacity
      : typeof data.battery_capacity === "string"
      ? Number(data.battery_capacity)
      : Number.NaN;
  const batteryCapacity = Number.isFinite(batteryCapacityRaw)
    ? Number(batteryCapacityRaw)
    : null;
  const chargingStatus =
    typeof data.chargingStatus === "string" && data.chargingStatus.trim()
      ? data.chargingStatus.trim()
      : typeof data.charging_status === "string" &&
        data.charging_status.trim()
      ? data.charging_status.trim()
      : null;
  const isActive =
    typeof data.isActive === "boolean"
      ? data.isActive
      : typeof data.active === "boolean"
      ? data.active
      : typeof data.is_active === "boolean"
      ? data.is_active
      : false;
  const batteryPercentRaw =
    typeof data.batteryPercent === "number"
      ? data.batteryPercent
      : typeof data.batteryPercent === "string"
      ? Number(data.batteryPercent)
      : typeof data.battery_percent === "number"
      ? data.battery_percent
      : typeof data.battery_percent === "string"
      ? Number(data.battery_percent)
      : Number.NaN;
  const batteryPercent = Number.isFinite(batteryPercentRaw)
    ? Number(batteryPercentRaw)
    : null;
  const batteryStatus =
    typeof data.batteryStatus === "string" && data.batteryStatus.trim()
      ? data.batteryStatus.trim()
      : typeof data.battery_status === "string" &&
        data.battery_status.trim()
      ? data.battery_status.trim()
      : null;
  const lastBatteryUpdatedAt =
    typeof data.lastBatteryUpdatedAt === "string" &&
    data.lastBatteryUpdatedAt.trim()
      ? data.lastBatteryUpdatedAt.trim()
      : typeof data.last_battery_updated_at === "string" &&
        data.last_battery_updated_at.trim()
      ? data.last_battery_updated_at.trim()
      : null;
  return {
    id,
    name,
    connectorTypes,
    minKW,
    batteryCapacity,
    chargingStatus,
    batteryPercent,
    batteryStatus,
    lastBatteryUpdatedAt,
    isActive,
  };
};

const normalizeHistoryItem = (
  historyItem: unknown,
  index: number
): ChargingHistoryItem | null => {
  if (!historyItem || typeof historyItem !== "object") return null;
  const data = historyItem as Record<string, unknown>;
  const id =
    toCleanString(data.id ?? data._id) || `history-${Date.now()}-${index}`;
  const endedAt = toDateMs(data.endedAt ?? data.ended_at);
  const outcomeRaw = toCleanString(data.outcome).toUpperCase();
  const stationName = toCleanString(data.stationName ?? data.station_name);
  const stationAddress = toCleanString(
    data.stationAddress ?? data.station_address
  );
  const vehicleName = toCleanString(data.vehicleName ?? data.vehicle_name);
  const progressPercent =
    toProgressPercent(data.progressPercent ?? data.progress_percent) ?? null;
  const batteryPercentage =
    toProgressPercent(data.batteryPercentage ?? data.battery_percentage) ?? null;
  const connectorType = toCleanString(
    data.connectorType ?? data.connector_type
  );

  return {
    id,
    endedAt,
    outcome: outcomeRaw || null,
    stationName,
    stationAddress,
    vehicleName,
    progressPercent,
    batteryPercentage,
    connectorType: connectorType || null,
  };
};

const isVehicleCharging = (car: UserCar) =>
  typeof car.chargingStatus === "string" &&
  car.chargingStatus.trim().toUpperCase() === "CHARGING";

// Profile page container that wires data, dialogs, and subcomponents together.
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("profile");
  const loaderData = useLoaderData() as ProfileLoaderData | null;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const email = useAppSelector((state) => state.auth.email);
  const userId = useAppSelector((state) => state.auth.userId);
  const profileName = useAppSelector((state) => state.auth.name);
  const profileRegion = useAppSelector((state) => state.auth.region);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [carError, setCarError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<ChargingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const carsRef = useRef(cars);
  const chargingVehicleId = useMemo(
    () => cars.find(isVehicleCharging)?.id ?? null,
    [cars]
  );

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistoryItems([]);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    setHistoryLoading(true);
    setHistoryError(null);

    const loadChargingHistory = async () => {
      const result = await fetchChargingHistory(controller.signal);
      if (!active) return;
      if (!result.ok) {
        setHistoryError(result.error || t("toast.historyError"));
        setHistoryItems([]);
        setHistoryLoading(false);
        return;
      }
      const normalized = result.history
        .map((item, index) => normalizeHistoryItem(item, index))
        .filter((item): item is ChargingHistoryItem => !!item);
      setHistoryItems(normalized);
      setHistoryLoading(false);
    };

    loadChargingHistory();
    return () => {
      active = false;
      controller.abort();
    };
  }, [isAuthenticated, t]);

  const profileImageUrl = resolveAssetUrl(loaderData?.user?.image);

  const displayName = useMemo(() => {
    if (profileName && profileName.trim()) return profileName.trim();
    if (!email) return t("overview.defaultName");
    const [name] = email.split("@");
    return name
      ? name.replace(/[^a-zA-Z0-9]+/g, " ").trim()
      : t("overview.defaultName");
  }, [email, profileName, t]);

  const regionLabel = profileRegion?.trim() || "Jakarta, ID";

  const initials = useMemo(() => {
    const parts = displayName.split(" ").filter(Boolean);
    if (!parts.length) return "D";
    return parts[0].charAt(0).toUpperCase();
  }, [displayName]);

  const handleOpenProfileEditor = () => {
    setProfileError(null);
    setProfileOpen(true);
  };

  const handleProfileSubmit = async (
    values: EditProfileValues,
    image: File | null
  ) => {
    setProfileError(null);
    const result = await updateProfileRequest({
      userId: userId || "",
      name: values.name,
      region: values.region,
      image,
    });
    if (result.ok) {
      const region = values.region || null;
      dispatch(updateProfile({ name: values.name, region }));
      persistProfileToStorage(values.name, region);
      setProfileOpen(false);
    } else {
      setProfileError(result.error);
    }
  };

  useEffect(() => {
    if (!loaderData) return;

    const { user, vehicles, activeCarId: storedActiveId } = loaderData;
    if (user && typeof user === "object") {
      const { name, region, role } = user;
      const hasRole = Object.prototype.hasOwnProperty.call(user, "role");
      const nextName =
        typeof name === "string" && name.trim() ? name.trim() : null;
      const nextRegion =
        typeof region === "string" && region.trim() ? region.trim() : null;
      const nextRole = hasRole
        ? typeof role === "string" && role.trim()
          ? role.trim()
          : null
        : undefined;
      if (nextName || nextRegion || nextRole) {
        dispatch(
          updateProfile({
            name: nextName,
            region: nextRegion,
            ...(hasRole ? { role: nextRole } : {}),
          })
        );
        if (hasRole) {
          persistProfileToStorage(nextName, nextRegion, nextRole);
        } else {
          persistProfileToStorage(nextName, nextRegion);
        }
      }
    }

    if (!Array.isArray(vehicles)) return;
    const remappedVehicles = vehicles
      .map((v: unknown) => normalizeVehicle(v))
      .filter((car): car is UserCar => !!car);
    const serverActiveId =
      remappedVehicles.find((car) => car.isActive)?.id ?? null;
    const nextActiveId =
      serverActiveId ||
      (storedActiveId &&
      remappedVehicles.some((car) => car.id === storedActiveId)
        ? storedActiveId
        : remappedVehicles[0]?.id ?? null);
    dispatch(
      setCars({
        cars: remappedVehicles,
        activeCarId: nextActiveId,
      })
    );
    persistCarsToStorage(remappedVehicles, nextActiveId);
  }, [dispatch, loaderData]);

  useEffect(() => {
    if (!chargingVehicleId) return;
    let active = true;
    let controller: AbortController | null = null;
    let isLoading = false;

    const refreshChargingVehicle = async () => {
      if (isLoading) return;
      isLoading = true;
      const nextController = new AbortController();
      controller = nextController;
      const result = await fetchVehicleById(
        chargingVehicleId,
        nextController.signal
      );
      if (!active) return;
      if (result.ok && result.vehicle) {
        const normalized = normalizeVehicle(result.vehicle);
        if (normalized) {
          const nextCars = carsRef.current.map((car) =>
            car.id === normalized.id ? { ...car, ...normalized } : car
          );
          dispatch(
            setCars({
              cars: nextCars,
              activeCarId,
            })
          );
          persistCarsToStorage(nextCars, activeCarId);
        }
      }
      isLoading = false;
    };

    refreshChargingVehicle();
    const intervalId = window.setInterval(
      refreshChargingVehicle,
      CHARGING_VEHICLE_REFRESH_MS
    );
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [activeCarId, chargingVehicleId, dispatch]);

  const handleOpenPasswordEditor = () => {
    setPasswordError(null);
    setPasswordOpen(true);
  };

  const handlePasswordSubmit = async (values: ChangePasswordValues) => {
    setPasswordError(null);
    const result = await changePasswordRequest({
      userId: userId || "",
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (result.ok) {
      setPasswordToast(t("toast.passwordUpdated"));
      setPasswordOpen(false);
    } else {
      setPasswordError(result.error);
    }
  };

  const handleSetActive = async (carId: string) => {
    setCarError(null);
    const result = await setActiveVehicleRequest({ vehicleId: carId, userId });
    if (!result.ok) {
      setCarError(result.error || t("toast.setActiveError"));
      return;
    }
    dispatch(setActiveCar(carId));
    persistCarsToStorage(cars, carId);
  };

  const handleEditCar = (carId: string) => {
    navigate(`/profile/cars/${carId}/edit`);
  };

  const handleRemoveCar = async (carId: string) => {
    setCarError(null);
    const result = await deleteVehicleRequest({ vehicleId: carId, userId });
    if (!result.ok) {
      setCarError(result.error || t("toast.deleteError"));
      return;
    }

    const nextCars = cars.filter((c) => c.id !== carId);
    const nextActiveId =
      activeCarId === carId ? nextCars[0]?.id ?? null : activeCarId;
    dispatch(removeCar(carId));
    persistCarsToStorage(nextCars, nextActiveId);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1.5, sm: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: { xs: "100%", sm: 850, md: 900 }, mx: "auto" }}>
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Box sx={{ mb: { xs: 0, sm: 0.5 } }}>
            <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: { xs: 22, sm: 26, md: 32 } }}>
              {t("page.title")}
            </Typography>
            <Typography sx={{ color: UI.text2, fontSize: { xs: 13, sm: 14 } }}>
              {t("page.subtitle")}
            </Typography>
          </Box>

          <ProfileOverviewCard
            displayName={displayName}
            email={email}
            regionLabel={regionLabel}
            initials={initials}
            avatarUrl={profileImageUrl}
            onEditProfile={handleOpenProfileEditor}
            onChangePassword={handleOpenPasswordEditor}
          />

          <LanguageCard />

          <CarsCard
            cars={cars}
            activeCarId={activeCarId}
            onAddCar={() => navigate("/profile/cars/new")}
            onSetActive={handleSetActive}
            onRemove={handleRemoveCar}
            onEdit={handleEditCar}
          />

          <ChargingHistoryCard
            items={historyItems}
            loading={historyLoading}
            error={historyError}
          />
        </Stack>
      </Box>

      <EditProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        email={email}
        initialName={profileName?.trim() || displayName}
        initialRegion={profileRegion?.trim() || "Jakarta, ID"}
        serverError={profileError}
        onDismissError={() => setProfileError(null)}
        onSubmit={handleProfileSubmit}
      />

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        serverError={passwordError}
        onDismissError={() => setPasswordError(null)}
        onSubmit={handlePasswordSubmit}
      />

      <Snackbar
        open={!!passwordToast}
        autoHideDuration={4000}
        onClose={() => setPasswordToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setPasswordToast(null)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {passwordToast}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!carError}
        autoHideDuration={4000}
        onClose={() => setCarError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCarError(null)}
          severity="error"
          variant="filled"
          sx={{ borderRadius: 3 }}
        >
          {carError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
