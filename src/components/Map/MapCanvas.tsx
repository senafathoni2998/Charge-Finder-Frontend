import { Box, Stack, Typography } from "@mui/material";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import Supercluster from "supercluster";
import LegendRow from "./LegendRow";
import { UI } from "../../theme/theme";
import { CHARGING_COLOR, statusColor } from "../../utils/map";
import { haversineKm } from "../../utils/distance";
import "leaflet/dist/leaflet.css";

// Use Leaflet's canvas renderer in real browsers (one <canvas> instead of an SVG
// node per marker). jsdom has no 2D canvas context, so fall back to SVG in tests.
const PREFER_CANVAS = (() => {
  try {
    return (
      typeof document !== "undefined" &&
      !!document.createElement("canvas").getContext("2d")
    );
  } catch {
    return false;
  }
})();

// Reads the current map view: zoom, bbox (for supercluster), center and an
// approximate radius (km) covering the viewport — used for viewport-driven fetch.
function readMapView(map) {
  const zoom = map.getZoom();
  const b = map.getBounds();
  const center = map.getCenter();
  const west = b.getWest();
  const south = b.getSouth();
  const east = b.getEast();
  const north = b.getNorth();
  const radiusKm = haversineKm(
    { lat: center.lat, lng: center.lng },
    { lat: north, lng: east }
  );
  return {
    zoom,
    bbox: [west, south, east, north],
    center: { lat: center.lat, lng: center.lng },
    radiusKm,
  };
}

// Fits the map to the station bounds ONCE (on first valid bounds). After that the
// view is user-controlled, so viewport-driven refetching can't fight auto-fitting.
function FitBounds({ bounds }) {
  const map = useMap();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (didFitRef.current) return;
    if (
      !bounds ||
      !Number.isFinite(bounds.minLat) ||
      !Number.isFinite(bounds.minLng) ||
      !Number.isFinite(bounds.maxLat) ||
      !Number.isFinite(bounds.maxLng)
    )
      return;
    map.fitBounds(
      [
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng],
      ],
      { padding: [40, 40] }
    );
    didFitRef.current = true;
  }, [map, bounds]);

  return null;
}

function FocusStation({ selectedId, stations, zoom = 15 }) {
  const map = useMap();
  const lastIdRef = useRef(null);

  useEffect(() => {
    if (!selectedId) {
      lastIdRef.current = null;
      return;
    }
    if (lastIdRef.current === selectedId) return;
    const target = stations.find((s) => s.id === selectedId);
    if (!target) return;
    if (!Number.isFinite(target.lat) || !Number.isFinite(target.lng)) return;
    lastIdRef.current = selectedId;
    map.setView([target.lat, target.lng], Math.max(map.getZoom(), zoom), {
      animate: false,
    });
  }, [map, selectedId, stations, zoom]);

  return null;
}

// Renders the (2-3) layered CircleMarkers for a single station.
function StationMarkers({ station, isActive, onSelect }) {
  const s = station;
  const isCharging = Boolean(s.isChargingHere);
  const color = statusColor(s.status, isCharging);
  return (
    <Fragment>
      {isCharging ? (
        <CircleMarker
          center={[s.lat, s.lng]}
          radius={isActive ? 22 : 18}
          interactive={false}
          pathOptions={{
            color: CHARGING_COLOR,
            fillColor: CHARGING_COLOR,
            fillOpacity: 0.18,
            weight: 2,
            className: "cf-charging-halo",
          }}
        />
      ) : null}
      <CircleMarker
        center={[s.lat, s.lng]}
        radius={isActive ? 18 : 14}
        interactive={false}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: isActive ? 0.18 : 0.12,
          weight: 0,
          className: `cf-marker-halo ${isActive ? "is-active" : ""}`,
        }}
      />
      <CircleMarker
        center={[s.lat, s.lng]}
        radius={isActive ? 9 : 7}
        pathOptions={{
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 0.95,
          weight: 2,
          className: `cf-marker-core ${isActive ? "is-active" : ""}`,
        }}
        eventHandlers={{
          click: () => onSelect?.(s.id),
        }}
      >
        <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
          {s.name} • {isCharging ? `Charging • ${s.status}` : s.status}
        </Tooltip>
      </CircleMarker>
    </Fragment>
  );
}

// Clusters stations with supercluster and renders cluster bubbles (low zoom) or
// individual station markers (high zoom). Also reports viewport changes (debounced)
// for viewport-driven station fetching.
function StationLayer({ stations, selectedId, onSelect, onViewportChange }) {
  const map = useMap();
  const [view, setView] = useState(() => readMapView(map));
  const debounceRef = useRef(null);

  useMapEvents({
    moveend: () => {
      const next = readMapView(map);
      setView(next);
      if (onViewportChange) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onViewportChange(next.center.lat, next.center.lng, next.radiusKm);
        }, 400);
      }
    },
    zoomend: () => setView(readMapView(map)),
  });

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const index = useMemo(() => {
    const sc = new Supercluster({ radius: 64, maxZoom: 17 });
    sc.load(
      stations
        .filter(
          (s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
        )
        .map((s) => ({
          type: "Feature",
          properties: { cluster: false, station: s },
          geometry: { type: "Point", coordinates: [s.lng, s.lat] },
        }))
    );
    return sc;
  }, [stations]);

  const clusters = useMemo(() => {
    try {
      return index.getClusters(view.bbox, Math.round(view.zoom));
    } catch {
      return [];
    }
  }, [index, view]);

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        if (props.cluster) {
          const count = props.point_count;
          const size = count < 10 ? 16 : count < 100 ? 22 : 28;
          return (
            <CircleMarker
              key={`cluster-${feature.id}`}
              center={[lat, lng]}
              radius={size}
              pathOptions={{
                color: "#ffffff",
                fillColor: "rgba(124,92,255,0.92)",
                fillOpacity: 0.92,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    index.getClusterExpansionZoom(feature.id),
                    18
                  );
                  map.setView([lat, lng], expansionZoom, { animate: true });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                {count} stations
              </Tooltip>
            </CircleMarker>
          );
        }

        const station = props.station;
        return (
          <StationMarkers
            key={station.id}
            station={station}
            isActive={selectedId === station.id}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}

export default function MapCanvas({
  stations = [],
  bounds,
  selectedId,
  onSelect,
  userLoc,
  onViewportChange,
}) {
  const mapBounds = useMemo<LatLngBoundsExpression>(() => {
    if (
      !bounds ||
      !Number.isFinite(bounds.minLat) ||
      !Number.isFinite(bounds.minLng) ||
      !Number.isFinite(bounds.maxLat) ||
      !Number.isFinite(bounds.maxLng)
    ) {
      return [
        [0, 0],
        [0, 0],
      ];
    }
    return [
      [bounds.minLat, bounds.minLng],
      [bounds.maxLat, bounds.maxLng],
    ];
  }, [bounds]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        border: `1px solid ${UI.border2}`,
        borderRadius: 0,
        "& .leaflet-container": {
          height: "100%",
          width: "100%",
          fontFamily: "inherit",
        },
        "& .cf-marker-core, & .cf-user-core": {
          filter: "drop-shadow(0 6px 12px rgba(10,10,16,0.25))",
          transformBox: "fill-box",
          transformOrigin: "center",
          transition: "transform 140ms ease",
        },
        "& .cf-marker-core.is-active": {
          transform: "scale(1.08)",
        },
        "& .cf-marker-halo.is-active": {
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: "cf-pulse 1.6s ease-out infinite",
        },
        "& .cf-user-halo": {
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: "cf-user-pulse 2s ease-out infinite",
        },
        "& .cf-charging-halo": {
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: "cf-charging-pulse 1.4s ease-out infinite",
        },
        "@keyframes cf-pulse": {
          "0%": { transform: "scale(1)", opacity: 0.7 },
          "70%": { transform: "scale(1.25)", opacity: 0.2 },
          "100%": { transform: "scale(1.32)", opacity: 0 },
        },
        "@keyframes cf-user-pulse": {
          "0%": { transform: "scale(1)", opacity: 0.6 },
          "70%": { transform: "scale(1.35)", opacity: 0.18 },
          "100%": { transform: "scale(1.45)", opacity: 0 },
        },
        "@keyframes cf-charging-pulse": {
          "0%": { transform: "scale(1)", opacity: 0.7 },
          "70%": { transform: "scale(1.4)", opacity: 0.2 },
          "100%": { transform: "scale(1.55)", opacity: 0 },
        },
      }}
    >
      {/* preferCanvas renders markers on a single <canvas> instead of one SVG node
          each — essential when many stations are visible. */}
      <MapContainer bounds={mapBounds} preferCanvas={PREFER_CANVAS}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        <FocusStation selectedId={selectedId} stations={stations} />

        <StationLayer
          stations={stations}
          selectedId={selectedId}
          onSelect={onSelect}
          onViewportChange={onViewportChange}
        />

        {userLoc && (
          <>
            <CircleMarker
              center={[userLoc.lat, userLoc.lng]}
              radius={16}
              interactive={false}
              pathOptions={{
                color: "rgba(124,92,255,0.9)",
                fillColor: "rgba(124,92,255,0.6)",
                fillOpacity: 0.12,
                weight: 2,
                className: "cf-user-halo",
              }}
            />
            <CircleMarker
              center={[userLoc.lat, userLoc.lng]}
              radius={6}
              pathOptions={{
                color: "#ffffff",
                fillColor: "rgba(124,92,255,0.98)",
                fillOpacity: 0.98,
                weight: 2,
                className: "cf-user-core",
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
                Your location
              </Tooltip>
            </CircleMarker>
          </>
        )}
      </MapContainer>

      {/* Legend */}
      <Box
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          zIndex: 1000,
          p: 1.25,
          borderRadius: 3,
          border: `1px solid ${UI.border}`,
          backgroundColor: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 24px rgba(10,10,16,0.08)",
          "@media (max-width: 900px)": {
            top: selectedId ? 12 : 60,
          },
        }}
      >
        <Stack spacing={0.75}>
          <Typography sx={{ fontWeight: 950, fontSize: 13, color: UI.text }}>
            Map Explorer
          </Typography>
          <LegendRow label="Available" color="rgba(0,229,255,0.95)" />
          <LegendRow label="Busy" color="rgba(255,193,7,0.95)" />
          <LegendRow label="Offline" color="rgba(244,67,54,0.95)" />
          <LegendRow label="Charging" color={CHARGING_COLOR} />
          <LegendRow label="You" color="rgba(124,92,255,0.98)" />
        </Stack>
      </Box>

      {/* Hint overlay */}
      {!selectedId && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            "@media (max-width: 900px)": {
              left: 8,
              right: 72,
            },
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
      )}
    </Box>
  );
}
