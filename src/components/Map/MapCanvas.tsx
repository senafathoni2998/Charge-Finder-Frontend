import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import LegendRow from "./LegendRow";
import { UI } from "../../theme/theme";
import { statusColor } from "../../utils/map";
import "leaflet/dist/leaflet.css";

function FitBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
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
  }, [map, bounds]);

  return null;
}

export default function MapCanvas({
  stations = [],
  bounds,
  selectedId,
  onSelect,
  userLoc,
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
      }}
    >
      <MapContainer bounds={mapBounds}>
        <TileLayer
          // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />

        {stations.map((s) => {
          const isActive = selectedId === s.id;
          const color = statusColor(s.status);
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              // radius={isActive ? 9 : 7}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isActive ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelect?.(s.id),
              }}
            >
              <Tooltip>
                {s.name} • {s.status}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {userLoc && (
          <CircleMarker
            center={[userLoc.lat, userLoc.lng]}
            // radius={6}
            pathOptions={{
              color: "rgba(124,92,255,0.98)",
              fillColor: "rgba(124,92,255,0.98)",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Tooltip>Your location</Tooltip>
          </CircleMarker>
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
          zIndex: 1000,
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
