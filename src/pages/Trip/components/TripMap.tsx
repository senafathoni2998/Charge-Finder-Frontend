import { useEffect } from "react";
import { Box } from "@mui/material";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import "leaflet/dist/leaflet.css";

export type MapPoint = { lat: number; lng: number };
export type MapStop = { lat: number; lng: number; label: string };

type TripMapProps = {
  origin: MapPoint | null;
  destination: MapPoint | null;
  stops?: MapStop[];
  /** Called with the clicked coordinates so the page can set origin/destination. */
  onMapClick?: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [-6.2, 106.8167];
const LL = (p: MapPoint): [number, number] => [p.lat, p.lng];

// Keeps the whole route (origin, stops, destination) in view whenever it changes.
function FitToRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 12, { animate: false });
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], animate: false });
    }
  }, [map, points]);
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onMapClick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// Interactive route map: origin (green), destination (red), numbered charging stops
// (purple), with a polyline through the whole route. Clicking reports coordinates.
export default function TripMap({
  origin,
  destination,
  stops = [],
  onMapClick,
}: TripMapProps) {
  const { t } = useTranslation("trip");
  const routePoints: [number, number][] = [];
  if (origin) routePoints.push(LL(origin));
  for (const stop of stops) routePoints.push([stop.lat, stop.lng]);
  if (destination) routePoints.push(LL(destination));

  return (
    <Box
      sx={{
        height: 340,
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${UI.border2}`,
        "& .leaflet-container": { height: "100%", width: "100%" },
      }}
    >
      <MapContainer center={origin ? LL(origin) : DEFAULT_CENTER} zoom={11}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitToRoute points={routePoints} />
        <ClickHandler onMapClick={onMapClick} />

        {routePoints.length >= 2 ? (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: "rgba(124,92,255,0.85)", weight: 4 }}
          />
        ) : null}

        {origin ? (
          <CircleMarker
            center={LL(origin)}
            radius={9}
            pathOptions={{ color: "#2e7d32", fillColor: "#2e7d32", fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip>{t("map.origin")}</Tooltip>
          </CircleMarker>
        ) : null}

        {stops.map((stop, index) => (
          <CircleMarker
            key={`${stop.lat},${stop.lng},${index}`}
            center={[stop.lat, stop.lng]}
            radius={8}
            pathOptions={{
              color: "rgba(124,92,255,0.95)",
              fillColor: "rgba(124,92,255,0.95)",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Tooltip>{`${index + 1}. ${stop.label}`}</Tooltip>
          </CircleMarker>
        ))}

        {destination ? (
          <CircleMarker
            center={LL(destination)}
            radius={9}
            pathOptions={{ color: "#d32f2f", fillColor: "#d32f2f", fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip>{t("map.destination")}</Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>
    </Box>
  );
}
