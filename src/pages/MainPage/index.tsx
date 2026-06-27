import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// NOTE: This page uses react-router for navigation in the full app.
import { Alert, Box, Drawer, Snackbar, useMediaQuery } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { fetchStationById, fetchStations } from "../../api/stations";
import { UI } from "../../theme/theme";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setMdMode, setSidebarOpen } from "../../features/app/appSlice";
import { setActiveCar } from "../../features/auth/authSlice";
import {
  boundsFromStations,
  filterStations,
  haversineKm,
} from "../../utils/distance";
import { useGeoLocation } from "../../hooks/geolocation-hook";
import type { ConnectorType } from "../../models/model";
import type { FilterStatus, Station, StationWithDistance } from "./types";
import {
  hasSeenDemoHint,
  markDemoHintSeen,
  persistActiveCarId,
} from "./mainPageStorage";
import { buildMapsUrl, isDemoStation } from "./utils";
import { DRAWER_WIDTH } from "./constants";
import FiltersPanel, {
  type FiltersPanelActions,
  type FiltersPanelAuthState,
  type FiltersPanelCarState,
  type FiltersPanelValues,
} from "./components/FiltersPanel";
import MapPanel, {
  type MapPanelActions,
  type MapPanelStationData,
  type MapPanelViewState,
} from "./components/MapPanel";

const CHARGING_STATION_REFRESH_MS = 60000;
const STATION_RADIUS_KM = 20;

export default function MainPage() {
  // Filters are local state (canvas-safe). In your real app, sync them to URL query.
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<FilterStatus>("");
  const [connectorSet, setConnectorSet] = useState<Set<ConnectorType>>(
    new Set(),
  );
  const [minKW, setMinKW] = useState(0);
  const [radiusKm, setRadiusKm] = useState(STATION_RADIUS_KM);
  const [useCarFilter, setUseCarFilter] = useState(false);
  const [carFilterTouched, setCarFilterTouched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [showDemoHint, setShowDemoHint] = useState(false);

  const drawerOpen = useAppSelector((state) => state.app.isSidebarOpen);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cars = useAppSelector((state) => state.auth.cars);
  const activeCarId = useAppSelector((state) => state.auth.activeCarId);

  // SSR-safe: prevents MUI from touching matchMedia during non-browser rendering.
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  useEffect(() => {
    dispatch(setMdMode(isMdUp));
  }, [dispatch, isMdUp]);

  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };
  // When the user pans the map, fetch + filter around the map view instead of their
  // location (viewport-driven fetching). Cleared when they re-request their location.
  const [mapView, setMapView] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const effectiveCenter = mapView ?? userCenter;
  const lastFetchRef = useRef({
    lat: effectiveCenter.lat,
    lng: effectiveCenter.lng,
  });

  useEffect(() => {
    geo.request();
  }, [geo.request]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadStations = async () => {
      lastFetchRef.current = {
        lat: effectiveCenter.lat,
        lng: effectiveCenter.lng,
      };
      const result = await fetchStations({
        signal: controller.signal,
        lat: effectiveCenter.lat,
        lng: effectiveCenter.lng,
        radiusKm,
      });
      if (!active) return;
      setStations(result.ok ? result.stations : []);
      // First-time UX: if the backend seeded demo stations near a user with nothing
      // nearby, tell them once so the (Demo) markers don't look like real stations.
      if (
        result.ok &&
        result.stations.some(isDemoStation) &&
        !hasSeenDemoHint()
      ) {
        markDemoHintSeen();
        setShowDemoHint(true);
      }
    };

    loadStations();
    return () => {
      active = false;
      controller.abort();
    };
  }, [geo.requestId, effectiveCenter.lat, effectiveCenter.lng, radiusKm]);
  const activeCar = useMemo(() => {
    if (!isAuthenticated) return null;
    return cars.find((c) => c.id === activeCarId) ?? null;
  }, [cars, activeCarId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !activeCar || !activeCar.connectorTypes.length) {
      setUseCarFilter(false);
      setCarFilterTouched(false);
      return;
    }
    if (!carFilterTouched) setUseCarFilter(true);
  }, [activeCar, carFilterTouched, isAuthenticated]);

  const carConnectorSet = useMemo(
    () => new Set(activeCar?.connectorTypes ?? []),
    [activeCar],
  );

  const effectiveConnectorSet = useMemo(() => {
    if (useCarFilter && carConnectorSet.size) return carConnectorSet;
    return connectorSet;
  }, [useCarFilter, carConnectorSet, connectorSet]);

  const effectiveMinKW = useMemo(() => {
    const base = Number.isFinite(minKW) ? minKW : 0;
    if (useCarFilter && activeCar && Number.isFinite(activeCar.minKW)) {
      return Math.max(base, activeCar.minKW);
    }
    return base;
  }, [minKW, useCarFilter, activeCar]);

  const filtered = useMemo<StationWithDistance[]>(() => {
    return filterStations(
      stations,
      {
        q,
        status,
        connectorSet: effectiveConnectorSet,
        minKW: effectiveMinKW,
        radiusKm,
      },
      effectiveCenter,
    );
  }, [
    stations,
    q,
    status,
    effectiveConnectorSet,
    effectiveMinKW,
    radiusKm,
    effectiveCenter,
  ]);

  const selectedStation = useMemo(
    () => filtered.find((station) => station.id === selectedId) || null,
    [filtered, selectedId],
  );

  const bounds = useMemo(
    () => boundsFromStations(filtered.length ? filtered : stations),
    [filtered, stations],
  );
  const activeChargingStationId = useMemo(
    () => stations.find((station) => station.isChargingHere)?.id ?? null,
    [stations],
  );

  useEffect(() => {
    if (!activeChargingStationId) return;
    let active = true;
    let controller: AbortController | null = null;
    let isLoading = false;

    const refreshChargingStation = async () => {
      if (isLoading) return;
      isLoading = true;
      const nextController = new AbortController();
      controller = nextController;
      const result = await fetchStationById(
        activeChargingStationId,
        nextController.signal,
      );
      if (!active) return;
      if (result.ok && result.station) {
        setStations((prev) =>
          prev.map((station) =>
            station.id === result.station?.id ? result.station : station,
          ),
        );
      }
      isLoading = false;
    };

    refreshChargingStation();
    const intervalId = window.setInterval(
      refreshChargingStation,
      CHARGING_STATION_REFRESH_MS,
    );
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(intervalId);
    };
  }, [activeChargingStationId]);

  const handleFocusStation = (station: StationWithDistance) => {
    setSelectedId(station.id);
    // Close sidebar on mobile when a station is selected
    if (!isMdUp) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleSelectCar = (carId: string) => {
    if (!carId) return;
    dispatch(setActiveCar(carId));
    persistActiveCarId(carId);
  };

  useEffect(() => {
    if (useCarFilter && !activeCar) {
      setUseCarFilter(false);
    } else if (useCarFilter && activeCar && !activeCar.connectorTypes.length) {
      setUseCarFilter(false);
    } else if (useCarFilter && activeCar) {
      setConnectorSet(new Set(activeCar.connectorTypes));
      setMinKW(activeCar.minKW || 0);
    }
  }, [useCarFilter, activeCar]);

  const handleToggleUseCarFilter = (checked: boolean) => {
    setUseCarFilter(checked);
    setCarFilterTouched(true);
  };

  const handleToggleConnector = (connector: ConnectorType) => {
    setConnectorSet((prev) => {
      const next = new Set(prev);
      if (next.has(connector)) next.delete(connector);
      else next.add(connector);
      return next;
    });
  };

  const handleLogin = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`,
    );
    navigate(`/login?next=${next}`);
  };

  const handleAddCar = () => {
    navigate("/profile/cars/new");
  };

  const handleRequestLocation = () => {
    setMapView(null);
    geo.request();
    // if (!isMdUp) dispatch(setSidebarOpen(true));
  };

  // F2: refetch around the new map center when the user pans beyond ~40% of the
  // current radius (a threshold + the debounce in MapCanvas prevent refetch loops).
  const handleViewportChange = useCallback(
    (lat: number, lng: number) => {
      const moved = haversineKm(lastFetchRef.current, { lat, lng });
      if (moved > Math.max(2, radiusKm * 0.4)) {
        setMapView({ lat, lng });
      }
    },
    [radiusKm],
  );

  const openGoogleMaps = (station: StationWithDistance) => {
    if (typeof window === "undefined") return;
    const url = buildMapsUrl(station.lat, station.lng);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMdUp ? `${DRAWER_WIDTH}px 1fr` : "1fr",
        height: "calc(100dvh - 64px)",
      }}
    >
      {isMdUp ? (
        <Box
          sx={{
            borderRight: `1px solid ${UI.border2}`,
            backgroundColor: UI.surface2,
            overflow: "auto",
          }}
        >
          <FiltersPanel
            filterValues={
              {
                query: q,
                status,
                connectorSet,
                minKW,
                radiusKm,
                useCarFilter,
              } satisfies FiltersPanelValues
            }
            filterActions={
              {
                onQueryChange: setQ,
                onStatusChange: setStatus,
                onToggleConnector: handleToggleConnector,
                onMinKWChange: setMinKW,
                onRadiusKmChange: setRadiusKm,
                onToggleUseCarFilter: handleToggleUseCarFilter,
              } satisfies FiltersPanelActions
            }
            authState={
              {
                isAuthenticated,
                onLogin: handleLogin,
                onAddCar: handleAddCar,
              } satisfies FiltersPanelAuthState
            }
            carState={
              {
                activeCarId,
                activeCar,
                cars,
                onSelectCar: handleSelectCar,
              } satisfies FiltersPanelCarState
            }
            effectiveMinKW={effectiveMinKW}
            stations={filtered}
            selectedId={selectedId}
            onFocusStation={handleFocusStation}
          />
        </Box>
      ) : (
        <Drawer
          open={drawerOpen}
          onClose={() => dispatch(setSidebarOpen(false))}
          PaperProps={{
            sx: {
              width: "min(92vw, 420px)",
              backgroundColor: UI.surface,
              borderRight: `1px solid ${UI.border2}`,
              color: UI.text,
            },
          }}
        >
          <FiltersPanel
            filterValues={
              {
                query: q,
                status,
                connectorSet,
                minKW,
                radiusKm,
                useCarFilter,
              } satisfies FiltersPanelValues
            }
            filterActions={
              {
                onQueryChange: setQ,
                onStatusChange: setStatus,
                onToggleConnector: handleToggleConnector,
                onMinKWChange: setMinKW,
                onRadiusKmChange: setRadiusKm,
                onToggleUseCarFilter: handleToggleUseCarFilter,
              } satisfies FiltersPanelActions
            }
            authState={
              {
                isAuthenticated,
                onLogin: handleLogin,
                onAddCar: handleAddCar,
              } satisfies FiltersPanelAuthState
            }
            carState={
              {
                activeCarId,
                activeCar,
                cars,
                onSelectCar: handleSelectCar,
              } satisfies FiltersPanelCarState
            }
            effectiveMinKW={effectiveMinKW}
            stations={filtered}
            selectedId={selectedId}
            onFocusStation={handleFocusStation}
          />
        </Drawer>
      )}

      <MapPanel
        stationData={
          {
            stations: filtered,
            bounds,
            selectedId,
            selectedStation,
            onSelectStation: setSelectedId,
          } satisfies MapPanelStationData
        }
        mapActions={
          {
            onViewDetails: (stationId) => navigate(`/station/${stationId}`),
            onOpenMaps: openGoogleMaps,
          } satisfies MapPanelActions
        }
        viewState={
          {
            isMdUp,
            onRequestLocation: handleRequestLocation,
            locationLoading: geo.loading,
            userLoc: geo.loc,
            drawerOpen,
            onViewportChange: handleViewportChange,
          } satisfies MapPanelViewState
        }
      />

      <Snackbar
        open={showDemoHint}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setShowDemoHint(false);
        }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setShowDemoHint(false)}
          sx={{ maxWidth: 460 }}
        >
          These are demo stations placed near you — one for each status
          (Available, Busy, Offline) so you can explore every state. Real
          stations appear here as they’re added.
        </Alert>
      </Snackbar>
    </Box>
  );
}
