import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
// NOTE: To keep this canvas runnable everywhere, this file does NOT require react-router.
// In your real app, you can wire navigation to routes like /stations/:id.
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Drawer,
  Divider,
  Stack,
  Chip,
  Card,
  CardContent,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import FilterListIcon from "@mui/icons-material/FilterList";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import LaunchIcon from "@mui/icons-material/Launch";
import CloseIcon from "@mui/icons-material/Close";

/**
 * ChargeFinder — Map Explorer Page (Canvas-safe) — LIGHT MODE
 *
 * Why this version?
 * - Some sandboxes don’t have react-router context (useNavigate/useSearchParams throws).
 * - Some sandboxes don’t have leaflet installed (module resolution fails at build time).
 *
 * So this page renders a "map-like" canvas with markers (no Leaflet).
 * In your real project you can swap MapCanvas -> LeafletMap easily.
 */

const UI = {
  bg: "#F6F7FB",
  surface: "#FFFFFF",
  surface2: "rgba(255,255,255,0.85)",
  glass: "rgba(255,255,255,0.72)",
  text: "rgba(10, 10, 16, 0.92)",
  text2: "rgba(10, 10, 16, 0.68)",
  text3: "rgba(10, 10, 16, 0.55)",
  border: "rgba(10, 10, 16, 0.12)",
  border2: "rgba(10, 10, 16, 0.08)",
  shadow: "0 12px 30px rgba(10,10,16,0.10)",
  brandGrad:
    "linear-gradient(135deg, rgba(124,92,255,0.95), rgba(0,229,255,0.85))",
  brandGradStrong:
    "linear-gradient(135deg, rgba(124,92,255,1), rgba(0,229,255,0.90))",
};

/** @typedef {"AVAILABLE"|"BUSY"|"OFFLINE"} Availability */
/** @typedef {"CCS2"|"Type2"|"CHAdeMO"} ConnectorType */

/**
 * @typedef Station
 * @property {string} id
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {string} address
 * @property {{type: ConnectorType, powerKW: number}[]} connectors
 * @property {Availability} status
 * @property {string} lastUpdatedISO
 */

const MOCK_STATIONS = /** @type {Station[]} */ [
  {
    id: "st-001",
    name: "Central Plaza Fast Charge",
    lat: -6.2009,
    lng: 106.8167,
    address: "Jl. MH Thamrin, Jakarta",
    connectors: [
      { type: "CCS2", powerKW: 100 },
      { type: "Type2", powerKW: 22 },
    ],
    status: "AVAILABLE",
    lastUpdatedISO: new Date(Date.now() - 7 * 60_000).toISOString(),
  },
  {
    id: "st-002",
    name: "Sudirman Hub",
    lat: -6.2146,
    lng: 106.8227,
    address: "Jl. Jend. Sudirman, Jakarta",
    connectors: [
      { type: "CCS2", powerKW: 60 },
      { type: "CHAdeMO", powerKW: 50 },
    ],
    status: "BUSY",
    lastUpdatedISO: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: "st-003",
    name: "Gandaria City Charger",
    lat: -6.2446,
    lng: 106.783,
    address: "Kebayoran Lama, Jakarta",
    connectors: [{ type: "Type2", powerKW: 11 }],
    status: "OFFLINE",
    lastUpdatedISO: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
  },
  {
    id: "st-004",
    name: "Kelapa Gading Supercharge",
    lat: -6.1577,
    lng: 106.905,
    address: "Kelapa Gading, Jakarta",
    connectors: [
      { type: "CCS2", powerKW: 150 },
      { type: "Type2", powerKW: 22 },
    ],
    status: "AVAILABLE",
    lastUpdatedISO: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
];

function minutesAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.round(diffMs / 60_000));
  return m;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function boundsFromStations(stations) {
  const lats = stations.map((s) => s.lat);
  const lngs = stations.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // avoid 0 span
  const latSpan = Math.max(0.00001, maxLat - minLat);
  const lngSpan = Math.max(0.00001, maxLng - minLng);
  return { minLat, maxLat, minLng, maxLng, latSpan, lngSpan };
}

function normalizeToCanvas(lat, lng, bounds) {
  // y inverted: higher lat -> smaller y
  const x = (lng - bounds.minLng) / bounds.lngSpan;
  const y = 1 - (lat - bounds.minLat) / bounds.latSpan;
  // clamp
  return {
    x: Math.min(0.98, Math.max(0.02, x)),
    y: Math.min(0.98, Math.max(0.02, y)),
  };
}

function useGeoLocation() {
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this environment.");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to get location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  return { loc, loading, error, request };
}

const DRAWER_WIDTH = 380;

function filterStations(stations, filters, userCenter) {
  const lower = filters.q.toLowerCase();
  return stations
    .filter((s) => {
      const matchesQ = !filters.q
        ? true
        : s.name.toLowerCase().includes(lower) ||
          s.address.toLowerCase().includes(lower);

      const matchesStatus = !filters.status
        ? true
        : s.status === filters.status;

      const matchesConnector = filters.connectorSet.size
        ? s.connectors.some((c) => filters.connectorSet.has(c.type))
        : true;

      const matchesMinKw = filters.minKW
        ? s.connectors.some((c) => c.powerKW >= filters.minKW)
        : true;

      return matchesQ && matchesStatus && matchesConnector && matchesMinKw;
    })
    .map((s) => {
      const distanceKm = haversineKm(userCenter, { lat: s.lat, lng: s.lng });
      return { ...s, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function StatusChip({ status }) {
  const map = {
    AVAILABLE: {
      label: "Available",
      sx: {
        borderColor: "rgba(0, 229, 255, 0.55)",
        backgroundColor: "rgba(0, 229, 255, 0.14)",
      },
    },
    BUSY: {
      label: "Busy",
      sx: {
        borderColor: "rgba(255, 193, 7, 0.55)",
        backgroundColor: "rgba(255, 193, 7, 0.14)",
      },
    },
    OFFLINE: {
      label: "Offline",
      sx: {
        borderColor: "rgba(244, 67, 54, 0.55)",
        backgroundColor: "rgba(244, 67, 54, 0.14)",
      },
    },
  };

  return (
    <Chip
      size="small"
      variant="outlined"
      label={map[status].label}
      sx={{
        borderRadius: 999,
        color: UI.text,
        fontWeight: 700,
        ...map[status].sx,
      }}
    />
  );
}

function ConnectorChip({ type, powerKW }) {
  return (
    <Chip
      size="small"
      label={`${type} • ${powerKW}kW`}
      sx={{
        borderRadius: 999,
        backgroundColor: "rgba(10,10,16,0.04)",
        border: `1px solid ${UI.border2}`,
        color: UI.text,
        fontWeight: 650,
      }}
    />
  );
}

function MarkerDot({
  x,
  y,
  color,
  active,
  label,
  onClick,
}: {
  x: number;
  y: number;
  color: string;
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip title={label} placement="top" arrow>
      <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        sx={{
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: "translate(-50%, -50%)",
          width: active ? 18 : 14,
          height: active ? 18 : 14,
          borderRadius: 999,
          cursor: "pointer",
          backgroundColor: color,
          boxShadow: active
            ? "0 0 0 10px rgba(124,92,255,0.14)"
            : "0 6px 18px rgba(10,10,16,0.18)",
          border: "2px solid rgba(255,255,255,0.95)",
        }}
      />
    </Tooltip>
  );
}

function statusColor(status) {
  if (status === "AVAILABLE") return "rgba(0,229,255,0.95)";
  if (status === "BUSY") return "rgba(255,193,7,0.95)";
  return "rgba(244,67,54,0.95)";
}

export default function ExplorePage() {
  // Filters are local state (canvas-safe). In your real app, sync them to URL query.
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(/** @type {""|Availability} */ "");
  const [connectorSet, setConnectorSet] = useState(new Set());
  const [minKW, setMinKW] = useState(0);

  // SSR-safe: prevents MUI from touching matchMedia during non-browser rendering.
  const isMdUp = useMediaQuery("(min-width:900px)", {
    noSsr: true,
    defaultMatches: true,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const stations = MOCK_STATIONS;
  const geo = useGeoLocation();
  const userCenter = geo.loc ?? { lat: -6.2, lng: 106.8167 };

  // Client-only self-tests (never run during server/module evaluation)
  useEffect(() => {
    if (typeof window !== "undefined") {
      runSelfTests();
    }
  }, []);

  const filtered = useMemo(() => {
    return filterStations(
      stations,
      {
        q,
        status,
        connectorSet,
        minKW,
      },
      userCenter
    );
  }, [stations, q, status, connectorSet, minKW, userCenter]);

  const selected = useMemo(
    () => filtered.find((s) => s.id === selectedId) || null,
    [filtered, selectedId]
  );

  const bounds = useMemo(
    () => boundsFromStations(filtered.length ? filtered : stations),
    [filtered, stations]
  );

  const focusStation = (s) => {
    setSelectedId(s.id);
  };

  const StationCard = ({ s }) => (
    <Card
      variant="outlined"
      onClick={() => focusStation(s)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        borderColor: selectedId === s.id ? "rgba(124,92,255,0.35)" : UI.border2,
        backgroundColor:
          selectedId === s.id ? "rgba(124,92,255,0.08)" : UI.surface,
        boxShadow:
          selectedId === s.id ? "none" : "0 10px 22px rgba(10,10,16,0.06)",
        transition:
          "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: UI.border,
          boxShadow: "0 14px 26px rgba(10,10,16,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box>
              <Typography
                sx={{ fontWeight: 850, lineHeight: 1.1, color: UI.text }}
              >
                {s.name}
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {s.address}
              </Typography>
            </Box>
            <StatusChip status={s.status} />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {s.connectors.slice(0, 3).map((c, idx) => (
              <ConnectorChip key={idx} type={c.type} powerKW={c.powerKW} />
            ))}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {s.distanceKm.toFixed(1)} km away
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Updated {minutesAgo(s.lastUpdatedISO)}m ago
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const FiltersPanel = (
    <Box sx={{ p: 2.25 }}>
      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 900, color: UI.text }}>
          Filters
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search station or area…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(10,10,16,0.04)",
              borderRadius: 3,
            },
          }}
        />

        <Box>
          <Typography variant="caption" sx={{ color: UI.text3 }}>
            Availability
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={status}
            onChange={(_, v) => setStatus(v ?? "")}
            size="small"
            sx={{
              mt: 1,
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                textTransform: "none",
                borderColor: UI.border2,
              },
            }}
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="AVAILABLE">Available</ToggleButton>
            <ToggleButton value="BUSY">Busy</ToggleButton>
            <ToggleButton value="OFFLINE">Offline</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: UI.text3 }}>
            Connector
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {
              /** @type {ConnectorType[]} */ ["CCS2", "Type2", "CHAdeMO"].map(
                (c) => {
                  const active = connectorSet.has(c);
                  return (
                    <Chip
                      key={c}
                      clickable
                      label={c}
                      variant={active ? "filled" : "outlined"}
                      onClick={() => {
                        setConnectorSet((prev) => {
                          const next = new Set(prev);
                          if (next.has(c)) next.delete(c);
                          else next.add(c);
                          return next;
                        });
                      }}
                      sx={{
                        borderRadius: 999,
                        backgroundColor: active
                          ? "rgba(124,92,255,0.12)"
                          : "transparent",
                        borderColor: active
                          ? "rgba(124,92,255,0.35)"
                          : UI.border2,
                        color: UI.text,
                        fontWeight: 700,
                      }}
                    />
                  );
                }
              )
            }
          </Stack>
        </Box>

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              Minimum power
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text2 }}>
              {minKW || 0} kW
            </Typography>
          </Stack>
          <Slider
            value={Number.isFinite(minKW) ? minKW : 0}
            onChange={(_, v) => setMinKW(Array.isArray(v) ? v[0] : v)}
            step={10}
            min={0}
            max={200}
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider sx={{ opacity: 0.35, borderColor: UI.border2 }} />

        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              Stations
            </Typography>
            <Chip
              size="small"
              label={`${filtered.length}`}
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
              }}
            />
          </Stack>

          <Stack spacing={1.2}>
            {filtered.map((s) => (
              <StationCard key={s.id} s={s} />
            ))}
            {!filtered.length && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px dashed ${UI.border}`,
                  backgroundColor: UI.surface,
                }}
              >
                <Typography sx={{ fontWeight: 900, color: UI.text }}>
                  No stations match your filters.
                </Typography>
                <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
                  Try clearing connector or lowering the minimum kW.
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );

  const openGoogleMaps = (s) => {
    if (typeof window === "undefined") return;
    const url = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ minHeight: "100dvh", backgroundColor: UI.bg }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: UI.glass,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${UI.border2}`,
          color: UI.text,
        }}
      >
        <Toolbar sx={{ gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              background: UI.brandGrad,
              boxShadow: "0 12px 30px rgba(124,92,255,0.14)",
              mr: 0.5,
              color: "white",
            }}
          >
            <ElectricCarIcon fontSize="small" />
          </Box>
          <Typography
            sx={{ fontWeight: 950, letterSpacing: 0.2, color: UI.text }}
          >
            ChargeFinder
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={geo.error || "Use my location"}>
            <span>
              <IconButton
                onClick={() => {
                  geo.request();
                  if (!isMdUp) setDrawerOpen(true);
                }}
                disabled={geo.loading}
                sx={{
                  border: `1px solid ${UI.border2}`,
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.03)",
                  color: UI.text,
                }}
                aria-label="Use my location"
              >
                {geo.loading ? (
                  <CircularProgress size={18} />
                ) : (
                  <MyLocationIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {!isMdUp && (
            <Tooltip title="Filters">
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  border: `1px solid ${UI.border2}`,
                  borderRadius: 3,
                  backgroundColor: "rgba(10,10,16,0.03)",
                  color: UI.text,
                }}
                aria-label="Open filters"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

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
            {FiltersPanel}
          </Box>
        ) : (
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: "min(92vw, 420px)",
                backgroundColor: UI.surface,
                borderRight: `1px solid ${UI.border2}`,
                color: UI.text,
              },
            }}
          >
            {FiltersPanel}
          </Drawer>
        )}

        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderLeft: isMdUp ? "none" : `1px solid ${UI.border2}`,
              backgroundColor: "transparent",
            }}
          >
            <MapCanvas
              stations={filtered}
              bounds={bounds}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              userLoc={geo.loc}
            />
          </Box>

          {selected && (
            <Card
              elevation={0}
              sx={{
                position: "absolute",
                right: 14,
                bottom: 14,
                width: "min(420px, calc(100% - 28px))",
                borderRadius: 4,
                border: `1px solid ${UI.border}`,
                backgroundColor: UI.surface2,
                backdropFilter: "blur(10px)",
                boxShadow: UI.shadow,
              }}
            >
              <CardContent sx={{ p: 2.25 }}>
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 950,
                          lineHeight: 1.1,
                          color: UI.text,
                        }}
                      >
                        {selected.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: UI.text2 }}>
                        {selected.address}
                      </Typography>
                    </Box>
                    <StatusChip status={selected.status} />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selected.connectors.map((c, idx) => (
                      <ConnectorChip
                        key={idx}
                        type={c.type}
                        powerKW={c.powerKW}
                      />
                    ))}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" sx={{ color: UI.text2 }}>
                      {selected.distanceKm.toFixed(1)} km away
                    </Typography>
                    <Typography variant="caption" sx={{ color: UI.text3 }}>
                      Updated {minutesAgo(selected.lastUpdatedISO)}m ago
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setDetailOpen(true)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 3,
                        boxShadow: "0 14px 40px rgba(124,92,255,0.14)",
                        background: UI.brandGradStrong,
                        color: "white",
                      }}
                    >
                      View details
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => openGoogleMaps(selected)}
                      sx={{
                        minWidth: 48,
                        borderRadius: 3,
                        borderColor: UI.border,
                        backgroundColor: "rgba(10,10,16,0.02)",
                        color: UI.text,
                      }}
                      aria-label="Open in Google Maps"
                    >
                      <LaunchIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <StationDetailDialog
        open={detailOpen}
        station={selected}
        onClose={() => setDetailOpen(false)}
        onOpenMaps={() => (selected ? openGoogleMaps(selected) : null)}
      />
    </Box>
  );
}

function MapCanvas({ stations, bounds, selectedId, onSelect, userLoc }) {
  const containerRef = useRef(null);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(900px 520px at 20% 10%, rgba(124,92,255,0.10), rgba(255,255,255,0) 60%),\n           radial-gradient(900px 520px at 70% 70%, rgba(0,229,255,0.08), rgba(255,255,255,0) 60%),\n           linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
        border: `1px solid ${UI.border2}`,
        borderRadius: 0,
      }}
    >
      {/* Fake grid to feel like a map */}
      <Box
        sx={{
          position: "absolute",
          inset: -2,
          backgroundImage:
            "linear-gradient(rgba(10,10,16,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,16,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      {/* Markers */}
      {stations.map((s) => {
        const p = normalizeToCanvas(s.lat, s.lng, bounds);
        return (
          <MarkerDot
            key={s.id}
            x={p.x}
            y={p.y}
            color={statusColor(s.status)}
            active={selectedId === s.id}
            label={`${s.name} • ${s.status}`}
            onClick={() => onSelect(s.id)}
          />
        );
      })}

      {userLoc && (
        <MarkerDot
          x={normalizeToCanvas(userLoc.lat, userLoc.lng, bounds).x}
          y={normalizeToCanvas(userLoc.lat, userLoc.lng, bounds).y}
          color="rgba(124,92,255,0.98)"
          active={false}
          label="Your location"
          onClick={() => {}}
        />
      )}

      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          left: 12,
          bottom: 12,
          p: 1.25,
          borderRadius: 3,
          border: `1px solid ${UI.border}`,
          backgroundColor: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 24px rgba(10,10,16,0.08)",
        }}
      >
        <Stack spacing={0.75}>
          <Typography sx={{ fontWeight: 950, fontSize: 13, color: UI.text }}>
            Map Explorer
          </Typography>
          <LegendRow label="Available" color="rgba(0,229,255,0.95)" />
          <LegendRow label="Busy" color="rgba(255,193,7,0.95)" />
          <LegendRow label="Offline" color="rgba(244,67,54,0.95)" />
          <LegendRow label="You" color="rgba(124,92,255,0.98)" />
        </Stack>
      </Box>

      {/* Hint overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            border: `1px solid ${UI.border}`,
            backgroundColor: "rgba(255,255,255,0.70)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 24px rgba(10,10,16,0.06)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: UI.text2, fontWeight: 650 }}
          >
            Click a marker to preview a station
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function LegendRow({ label, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: 999,
          backgroundColor: color,
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow: "0 6px 16px rgba(10,10,16,0.14)",
        }}
      />
      <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 650 }}>
        {label}
      </Typography>
    </Stack>
  );
}

function StationDetailDialog({ open, station, onClose, onOpenMaps }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: UI.surface,
          border: `1px solid ${UI.border}`,
          color: UI.text,
          boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 950, lineHeight: 1.1, color: UI.text }}>
            {station?.name || "Station"}
          </Typography>
          <Typography variant="body2" sx={{ color: UI.text2, mt: 0.25 }}>
            {station?.address || ""}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ color: UI.text2 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        {!station ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={18} />
            <Skeleton variant="rounded" height={18} />
            <Skeleton variant="rounded" height={18} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip status={station.status} />
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                Updated {minutesAgo(station.lastUpdatedISO)}m ago
              </Typography>
            </Stack>

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 0.75, color: UI.text }}>
                Connectors
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {station.connectors.map((c, idx) => (
                  <ConnectorChip key={idx} type={c.type} powerKW={c.powerKW} />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 900, mb: 0.75, color: UI.text }}>
                Coordinates
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {station.lat.toFixed(5)}, {station.lng.toFixed(5)}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                Next step
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
                In your real app, this dialog can be replaced by navigation to
                <b> /stations/{station.id}</b>.
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={onOpenMaps}
          disabled={!station}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Open in Maps
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Lightweight self-tests (no test runner needed).
 * These do NOT throw; they only log if something is wrong.
 */
function runSelfTests() {
  try {
    const iso1m = new Date(Date.now() - 60_000).toISOString();
    const m = minutesAgo(iso1m);
    console.assert(m === 1 || m === 0, "minutesAgo should be around 1 minute");

    const d0 = haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 0 });
    console.assert(Math.abs(d0) < 1e-9, "haversineKm same point should be 0");

    const d01 = haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    console.assert(
      d01 > 110 && d01 < 112,
      "haversineKm (0,0)->(0,1) should be about 111km"
    );

    const res = filterStations(
      MOCK_STATIONS,
      {
        q: "central",
        status: "",
        connectorSet: new Set(),
        minKW: 0,
      },
      { lat: -6.2, lng: 106.8167 }
    );
    console.assert(
      res.some((s) => s.id === "st-001"),
      "filterStations should match query against station name/address"
    );

    const res2 = filterStations(
      MOCK_STATIONS,
      {
        q: "",
        status: "AVAILABLE",
        connectorSet: new Set(["CCS2"]),
        minKW: 90,
      },
      { lat: -6.2, lng: 106.8167 }
    );
    console.assert(
      res2.every((s) => s.status === "AVAILABLE"),
      "filterStations should respect status filter"
    );
    console.assert(
      res2.every((s) =>
        s.connectors.some((c) => c.type === "CCS2" && c.powerKW >= 90)
      ),
      "filterStations should respect connector + minKW filters"
    );

    // Added tests (map normalization)
    const b = boundsFromStations(MOCK_STATIONS);
    const p = normalizeToCanvas(MOCK_STATIONS[0].lat, MOCK_STATIONS[0].lng, b);
    console.assert(
      p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1,
      "normalizeToCanvas should clamp to [0..1]"
    );

    console.assert(
      typeof statusColor("AVAILABLE") === "string" &&
        typeof statusColor("BUSY") === "string" &&
        typeof statusColor("OFFLINE") === "string",
      "statusColor should return strings"
    );
  } catch {
    // no-op
  }
}
