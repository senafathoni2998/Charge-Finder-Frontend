import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import { CONNECTOR_OPTIONS } from "../constants";
import type { FilterStatus, StationWithDistance } from "../types";
import StationsList from "./StationsList";

// ============================================================================
// TYPES - All props grouped by domain to reduce prop drilling
// ============================================================================

/** Current filter values selected by the user */
export interface FiltersPanelValues {
  query: string;
  status: FilterStatus;
  connectorSet: Set<ConnectorType>;
  minKW: number;
  radiusKm: number;
  useCarFilter: boolean;
}

/** Callback functions for handling filter changes */
export interface FiltersPanelActions {
  onQueryChange: (value: string) => void;
  onStatusChange: (value: FilterStatus) => void;
  onToggleConnector: (connector: ConnectorType) => void;
  onMinKWChange: (value: number) => void;
  onRadiusKmChange: (value: number) => void;
  onToggleUseCarFilter: (value: boolean) => void;
}

/** Authentication state and auth-related actions */
export interface FiltersPanelAuthState {
  isAuthenticated: boolean;
  onLogin: () => void;
  onAddCar: () => void;
}

/** User's car state and car selection actions */
export interface FiltersPanelCarState {
  activeCarId: string | null;
  activeCar: UserCar | null;
  cars: UserCar[];
  onSelectCar: (carId: string) => void;
}

/**
 * All props for the FiltersPanel component.
 *
 * Usage example:
 * ```tsx
 * <FiltersPanel
 *   filterValues={{ query, status, connectorSet, minKW, radiusKm, useCarFilter }}
 *   filterActions={{ onQueryChange, onStatusChange, ... }}
 *   authState={{ isAuthenticated, onLogin, onAddCar }}
 *   carState={{ activeCarId, activeCar, cars, onSelectCar }}
 *   effectiveMinKW={50}
 *   stations={filteredStations}
 *   selectedId={selectedId}
 *   onFocusStation={handleFocus}
 * />
 * ```
 */
export interface FiltersPanelProps {
  // ===== FILTER STATE =====
  filterValues: FiltersPanelValues;
  filterActions: FiltersPanelActions;

  // ===== AUTH STATE =====
  authState: FiltersPanelAuthState;

  // ===== CAR STATE =====
  carState: FiltersPanelCarState;

  // ===== UI STATE =====
  effectiveMinKW: number;
  stations: StationWithDistance[];
  selectedId: string | null;
  onFocusStation: (station: StationWithDistance) => void;
}

// ============================================================================
// STYLES
// ============================================================================

const ACCORDION_SX = {
  border: `1px solid ${UI.border2}`,
  borderRadius: 3,
  backgroundColor: "rgba(255,255,255,0.7)",
  boxShadow: "none",
  "&:before": { display: "none" },
};

const ACCORDION_SUMMARY_SX = {
  px: 1.5,
  minHeight: 48,
  "&.Mui-expanded": { minHeight: 48 },
  "& .MuiAccordionSummary-content": { margin: "8px 0" },
};

const ACCORDION_DETAILS_SX = { px: 1.5, pb: 1.5, pt: 0 };

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function GuestModePrompt({ onLogin }: { onLogin: () => void }) {
  const { t } = useTranslation("mainPage");
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px dashed ${UI.border}`,
        backgroundColor: "rgba(10,10,16,0.02)",
      }}
    >
      <Stack spacing={0.75}>
        <Typography sx={{ fontWeight: 900, color: UI.text }}>
          {t("guestMode.title")}
        </Typography>
        <Typography variant="body2" sx={{ color: UI.text2 }}>
          {t("guestMode.description")}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={onLogin}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
            alignSelf: "flex-start",
          }}
        >
          {t("guestMode.login")}
        </Button>
      </Stack>
    </Box>
  );
}

function CarSelector({
  activeCarId,
  cars,
  onSelectCar,
}: {
  activeCarId: string | null;
  cars: UserCar[];
  onSelectCar: (carId: string) => void;
}) {
  const { t } = useTranslation("mainPage");
  return (
    <TextField
      select
      size="small"
      label={t("car.selectedCar")}
      value={activeCarId ?? ""}
      onChange={(event) => onSelectCar(String(event.target.value))}
      fullWidth
      sx={{
        mt: 0.5,
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          backgroundColor: "rgba(10,10,16,0.02)",
        },
      }}
    >
      {cars.map((car) => (
        <MenuItem key={car.id} value={car.id}>
          {car.name}
          {Number.isFinite(car.batteryCapacity)
            ? ` | ${car.batteryCapacity} kWh`
            : ""}
        </MenuItem>
      ))}
    </TextField>
  );
}

function CarFilterToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  const { t } = useTranslation("mainPage");
  return (
    <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
          color="primary"
        />
      }
      label={
        <Typography sx={{ color: UI.text2, fontWeight: 700 }}>
          {t("car.useToFilter")}
        </Typography>
      }
      sx={{ ml: -0.5 }}
    />
  );
}

function AddCarPrompt({ onAddCar }: { onAddCar: () => void }) {
  const { t } = useTranslation("mainPage");
  return (
    <Stack spacing={1} sx={{ mt: 0.75 }}>
      <Typography variant="body2" sx={{ color: UI.text2 }}>
        {t("car.addPrompt")}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={onAddCar}
        sx={{
          textTransform: "none",
          borderRadius: 3,
          borderColor: UI.border,
          color: UI.text,
          alignSelf: "flex-start",
        }}
      >
        {t("car.addCar")}
      </Button>
    </Stack>
  );
}

function ConnectorFilters({
  connectorSet,
  useCarFilter,
  onToggleConnector,
}: {
  connectorSet: Set<ConnectorType>;
  useCarFilter: boolean;
  onToggleConnector: (connector: ConnectorType) => void;
}) {
  const { t } = useTranslation("mainPage");
  return (
    <Box>
      <Typography variant="caption" sx={{ color: UI.text3 }}>
        {t("filters.connectors")}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
        {CONNECTOR_OPTIONS.map((connector) => {
          const active = connectorSet.has(connector);
          const chipBg = active ? "rgba(124,92,255,0.12)" : "transparent";
          const chipBorder = active ? "rgba(124,92,255,0.35)" : UI.border2;
          return (
            <Chip
              key={connector}
              clickable
              label={connector}
              variant={active ? "filled" : "outlined"}
              disabled={useCarFilter}
              onClick={() => onToggleConnector(connector)}
              sx={{
                borderRadius: 999,
                backgroundColor: chipBg,
                borderColor: chipBorder,
                color: UI.text,
                fontWeight: 700,
                ...(useCarFilter && {
                  "&.Mui-disabled": {
                    opacity: 1,
                    color: UI.text,
                    backgroundColor: chipBg,
                    borderColor: chipBorder,
                  },
                }),
              }}
            />
          );
        })}
      </Stack>
      {useCarFilter && (
        <Typography
          variant="caption"
          sx={{ color: UI.text3, mt: 0.75, display: "block" }}
        >
          {t("filters.connectorsCarProfile")}
        </Typography>
      )}
    </Box>
  );
}

function MinPowerSlider({
  value,
  effectiveValue,
  useCarFilter,
  onChange,
}: {
  value: number;
  effectiveValue: number;
  useCarFilter: boolean;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation("mainPage");
  const displayValue = Number.isFinite(value) ? value : 0;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          {t("filters.minimumPower")}
        </Typography>
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          {effectiveValue || 0} kW
        </Typography>
      </Stack>
      <Slider
        disabled={useCarFilter}
        value={displayValue}
        onChange={(_, value) => onChange(Array.isArray(value) ? value[0] : value)}
        step={10}
        min={0}
        max={200}
        sx={{
          mt: 1,
          color: useCarFilter ? "rgba(124,92,255,0.9)" : undefined,
          ...(useCarFilter && {
            "&.Mui-disabled": { opacity: 1 },
          }),
        }}
      />
      {useCarFilter && (
        <Typography
          variant="caption"
          sx={{ color: UI.text3, mt: 0.75, display: "block" }}
        >
          {t("filters.minimumPowerCarProfile")}
        </Typography>
      )}
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FiltersPanel - Sidebar panel with search, filter controls, and station list.
 */
export default function FiltersPanel(props: FiltersPanelProps) {
  const { t } = useTranslation("mainPage");
  // ===== EXTRACT PROPS FOR EASIER ACCESS =====
  const { filterValues, filterActions, authState, carState } = props;

  // Filter values
  const { query, status, connectorSet, minKW, radiusKm, useCarFilter } = filterValues;

  // Filter actions
  const { onQueryChange, onStatusChange, onToggleConnector, onMinKWChange, onRadiusKmChange, onToggleUseCarFilter } = filterActions;

  // Auth state
  const { isAuthenticated, onLogin, onAddCar } = authState;

  // Car state
  const { activeCarId, activeCar, cars, onSelectCar } = carState;

  // Direct props
  const { effectiveMinKW, stations, selectedId, onFocusStation } = props;

  const displayRadiusKm = Number.isFinite(radiusKm) ? radiusKm : 0;

  return (
    <Box sx={{ p: 2.25 }}>
      <Stack spacing={2}>
        {/* ===== SEARCH SECTION ===== */}
        <Stack spacing={0.75}>
          <Typography variant="caption" sx={{ color: UI.text3 }}>
            {t("search.label")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
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
        </Stack>

        {/* ===== FILTERS ACCORDION ===== */}
        <Accordion defaultExpanded sx={ACCORDION_SX}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={ACCORDION_SUMMARY_SX}>
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              {t("filters.title")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={ACCORDION_DETAILS_SX}>
            <Stack spacing={2}>
              {/* Guest mode prompt */}
              {!isAuthenticated && <GuestModePrompt onLogin={onLogin} />}

              {/* Availability filter */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  {t("filters.availability")}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={status}
                  onChange={(_, value) => onStatusChange((value ?? "") as FilterStatus)}
                  size="small"
                  sx={{
                    mt: 0.5,
                    flexWrap: "wrap",
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      borderColor: UI.border2,
                    },
                  }}
                >
                  <ToggleButton value="">{t("filters.all")}</ToggleButton>
                  <ToggleButton value="AVAILABLE">{t("common:status.available")}</ToggleButton>
                  <ToggleButton value="BUSY">{t("common:status.busy")}</ToggleButton>
                  <ToggleButton value="OFFLINE">{t("common:status.offline")}</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Distance slider */}
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {t("filters.distance")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text3 }}>
                    {displayRadiusKm} km
                  </Typography>
                </Stack>
                <Slider
                  value={displayRadiusKm}
                  onChange={(_, value) =>
                    onRadiusKmChange(Array.isArray(value) ? value[0] : value)
                  }
                  step={1}
                  min={1}
                  max={50}
                  sx={{ mt: 1 }}
                />
              </Box>

              {/* Car-based filtering section */}
              {isAuthenticated && (
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" sx={{ color: UI.text3 }}>
                      {t("filters.myCar")}
                    </Typography>
                  </Stack>
                  {activeCar ? (
                    <Stack spacing={1} sx={{ mt: 0.75, pt: 0.75 }}>
                      <CarSelector
                        activeCarId={activeCarId}
                        cars={cars}
                        onSelectCar={onSelectCar}
                      />
                      <CarFilterToggle
                        enabled={useCarFilter}
                        onToggle={onToggleUseCarFilter}
                      />
                    </Stack>
                  ) : (
                    <AddCarPrompt onAddCar={onAddCar} />
                  )}
                </Box>
              )}

              {/* Connector filter */}
              <ConnectorFilters
                connectorSet={connectorSet}
                useCarFilter={useCarFilter}
                onToggleConnector={onToggleConnector}
              />

              {/* Minimum power slider */}
              <MinPowerSlider
                value={minKW}
                effectiveValue={effectiveMinKW}
                useCarFilter={useCarFilter}
                onChange={onMinKWChange}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ===== STATIONS LIST ===== */}
        <Divider sx={{ opacity: 0.35, borderColor: UI.border2 }} />
        <StationsList
          stations={stations}
          selectedId={selectedId}
          onFocusStation={onFocusStation}
        />
      </Stack>
    </Box>
  );
}
