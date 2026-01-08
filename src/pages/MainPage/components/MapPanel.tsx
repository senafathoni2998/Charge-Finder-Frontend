import { Box, CircularProgress, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapCanvas from "../../../components/Map/MapCanvas";
import { UI } from "../../../theme/theme";
import type { StationBounds, StationWithDistance } from "../types";
import SelectedStationCard from "./SelectedStationCard";

type MapPanelProps = {
  stations: StationWithDistance[];
  bounds: StationBounds;
  selectedId: string | null;
  onSelectStation: (id: string) => void;
  userLoc: { lat: number; lng: number } | null;
  selectedStation: StationWithDistance | null;
  onViewDetails: (stationId: string) => void;
  onOpenMaps: (station: StationWithDistance) => void;
  isMdUp: boolean;
  onRequestLocation: () => void;
  locationLoading: boolean;
};

// Renders the map canvas plus floating location and selection UI.
export default function MapPanel({
  stations,
  bounds,
  selectedId,
  onSelectStation,
  userLoc,
  selectedStation,
  onViewDetails,
  onOpenMaps,
  isMdUp,
  onRequestLocation,
  locationLoading,
}: MapPanelProps) {
  return (
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
          stations={stations}
          bounds={bounds}
          selectedId={selectedId}
          onSelect={onSelectStation}
          userLoc={userLoc}
        />
      </Box>

      <IconButton
        onClick={onRequestLocation}
        disabled={locationLoading}
        sx={{
          zIndex: 9999,
          position: "absolute",
          right: 14,
          bottom: 14,
          border: `1px solid ${UI.border2}`,
          borderRadius: 3,
          backgroundColor: "hsla(0, 0%, 97%, 1.00)",
          color: UI.text,
          boxShadow: UI.shadow,
          ":hover": { backgroundColor: "hsla(0, 0%, 95%, 1.00)" },
        }}
        aria-label="Use my location"
      >
        {locationLoading ? <CircularProgress size={18} /> : <MyLocationIcon />}
      </IconButton>

      {selectedStation ? (
        <SelectedStationCard
          station={selectedStation}
          onViewDetails={() => onViewDetails(selectedStation.id)}
          onOpenMaps={() => onOpenMaps(selectedStation)}
        />
      ) : null}
    </Box>
  );
}
