import { Box, CircularProgress, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapCanvas from "../../../components/Map/MapCanvas";
import { UI } from "../../../theme/theme";
import type { StationBounds, StationWithDistance } from "../types";
import SelectedStationCard from "./SelectedStationCard";

// ============================================================================
// CONSTANTS
// ============================================================================

const LOCATION_BUTTON_SX = {
  zIndex: 9999,
  position: "absolute" as const,
  right: 14,
  bottom: 14,
  border: `1px solid ${UI.border2}`,
  borderRadius: 3,
  backgroundColor: "hsla(0, 0%, 97%, 1.00)",
  color: UI.text,
  boxShadow: UI.shadow,
  ":hover": { backgroundColor: "hsla(0, 0%, 95%, 1.00)" },
};

// ============================================================================
// TYPES
// ============================================================================

/** Station data contains the list of stations and selection state */
export interface MapPanelStationData {
  stations: StationWithDistance[];
  bounds: StationBounds;
  selectedId: string | null;
  selectedStation: StationWithDistance | null;
  onSelectStation: (id: string) => void;
}

/** Map actions are user interactions with the map UI */
export interface MapPanelActions {
  onViewDetails: (stationId: string) => void;
  onOpenMaps: (station: StationWithDistance) => void;
}

/** View state contains UI state and location services */
export interface MapPanelViewState {
  isMdUp: boolean;
  onRequestLocation: () => void;
  locationLoading: boolean;
  userLoc: { lat: number; lng: number } | null;
  drawerOpen: boolean;
  /** Fired (debounced) when the user pans/zooms the map — drives viewport fetching. */
  onViewportChange?: (lat: number, lng: number, radiusKm: number) => void;
}

/**
 * All props for the MapPanel component, grouped by domain.
 *
 * Usage example:
 * ```tsx
 * <MapPanel
 *   stationData={{ stations, bounds, selectedId, selectedStation, onSelectStation }}
 *   mapActions={{ onViewDetails, onOpenMaps }}
 *   viewState={{ isMdUp, onRequestLocation, locationLoading, userLoc }}
 * />
 * ```
 */
export interface MapPanelProps {
  stationData: MapPanelStationData;
  mapActions: MapPanelActions;
  viewState: MapPanelViewState;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/** Floating button to request the user's current location */
function LocationButton({
  isLoading,
  onRequest,
}: {
  isLoading: boolean;
  onRequest: () => void;
}) {
  return (
    <IconButton
      onClick={onRequest}
      disabled={isLoading}
      sx={LOCATION_BUTTON_SX}
      aria-label="Use my location"
    >
      {isLoading ? <CircularProgress size={18} /> : <MyLocationIcon />}
    </IconButton>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MapPanel - Renders the map canvas plus floating location and selection UI.
 */
export default function MapPanel(props: MapPanelProps) {
  // ===== EXTRACT PROPS =====
  const { stationData, mapActions, viewState } = props;

  // Station data
  const { stations, bounds, selectedId, selectedStation, onSelectStation } = stationData;

  // Map actions
  const { onViewDetails, onOpenMaps } = mapActions;

  // View state
  const {
    isMdUp,
    onRequestLocation,
    locationLoading,
    userLoc,
    drawerOpen,
    onViewportChange,
  } = viewState;

  return (
    <Box sx={{ position: "relative" }}>
      {/* ===== MAP CANVAS ===== */}
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
          onViewportChange={onViewportChange}
        />
      </Box>

      {/* ===== LOCATION BUTTON ===== */}
      <LocationButton isLoading={locationLoading} onRequest={onRequestLocation} />

      {/* ===== SELECTED STATION CARD ===== */}
      {selectedStation && (
        <SelectedStationCard
          station={selectedStation}
          onViewDetails={() => onViewDetails(selectedStation.id)}
          onOpenMaps={() => onOpenMaps(selectedStation)}
          isMdUp={isMdUp}
          drawerOpen={drawerOpen}
        />
      )}
    </Box>
  );
}
