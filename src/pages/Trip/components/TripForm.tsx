import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { ConnectorType } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import type { TripPoint } from "../../../api/trips";

export type TripFormState = {
  origin: TripPoint | null;
  destination: TripPoint | null;
  vehicleId: string; // "" = none (plan by range)
  rangeKm: string;
  startBatteryPercent: string;
  bufferPercent: string;
  chargeToPercent: string;
  minPowerKW: string;
  maxDetourKm: string;
  efficiencyKwhPer100Km: string;
  connectorTypes: ConnectorType[];
};

export type PickMode = "origin" | "destination";

const CONNECTOR_OPTIONS: ConnectorType[] = ["CCS2", "Type2", "CHAdeMO"];

type TripFormProps = {
  value: TripFormState;
  onChange: (patch: Partial<TripFormState>) => void;
  cars: UserCar[];
  pickMode: PickMode;
  onPickModeChange: (mode: PickMode) => void;
  onUseMyLocation: () => void;
  locating: boolean;
  onPlan: () => void;
  planning: boolean;
  error: string | null;
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "rgba(10,10,16,0.02)",
  },
} as const;

const coordLabel = (point: TripPoint | null): string => {
  if (!point) return "";
  if (point.label) return point.label;
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
};

export default function TripForm({
  value,
  onChange,
  cars,
  pickMode,
  onPickModeChange,
  onUseMyLocation,
  locating,
  onPlan,
  planning,
  error,
}: TripFormProps) {
  const { t } = useTranslation("trip");

  // Editing a single lat/lng number in-place, preserving the other coordinate.
  const setCoord = (
    key: "origin" | "destination",
    axis: "lat" | "lng",
    raw: string
  ) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const current = value[key] ?? { lat: 0, lng: 0 };
    onChange({ [key]: { ...current, [axis]: n, label: undefined } } as Partial<TripFormState>);
  };

  const numberField = (
    key: keyof TripFormState,
    label: string,
    helper?: string
  ) => (
    <TextField
      label={label}
      type="number"
      value={value[key] as string}
      onChange={(e) => onChange({ [key]: e.target.value } as Partial<TripFormState>)}
      helperText={helper}
      fullWidth
      sx={fieldSx}
    />
  );

  const toggleConnector = (types: ConnectorType[]) =>
    onChange({ connectorTypes: types });

  return (
    <Stack spacing={2.25}>
      {/* Route */}
      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 800, color: UI.text }}>
          {t("form.route")}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={pickMode}
          onChange={(_e, mode) => mode && onPickModeChange(mode)}
          fullWidth
        >
          <ToggleButton value="origin" sx={{ textTransform: "none" }}>
            {t("form.setOrigin")}
          </ToggleButton>
          <ToggleButton value="destination" sx={{ textTransform: "none" }}>
            {t("form.setDestination")}
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          {t("form.mapHint")}
        </Typography>

        {/* Origin */}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 700, flex: 1 }}>
              {t("form.origin")}: {coordLabel(value.origin) || t("form.notSet")}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<MyLocationIcon fontSize="small" />}
              disabled={locating}
              onClick={onUseMyLocation}
              sx={{ textTransform: "none", borderRadius: 3, borderColor: UI.border, color: UI.text }}
            >
              {locating ? t("form.locating") : t("form.useMyLocation")}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
            <TextField
              label={t("form.lat")}
              type="number"
              value={value.origin?.lat ?? ""}
              onChange={(e) => setCoord("origin", "lat", e.target.value)}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label={t("form.lng")}
              type="number"
              value={value.origin?.lng ?? ""}
              onChange={(e) => setCoord("origin", "lng", e.target.value)}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
        </Box>

        {/* Destination */}
        <Box>
          <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 700 }}>
            {t("form.destination")}: {coordLabel(value.destination) || t("form.notSet")}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
            <TextField
              label={t("form.lat")}
              type="number"
              value={value.destination?.lat ?? ""}
              onChange={(e) => setCoord("destination", "lat", e.target.value)}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label={t("form.lng")}
              type="number"
              value={value.destination?.lng ?? ""}
              onChange={(e) => setCoord("destination", "lng", e.target.value)}
              fullWidth
              sx={fieldSx}
            />
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: UI.border2 }} />

      {/* Vehicle & range */}
      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 800, color: UI.text }}>
          {t("form.vehicleRange")}
        </Typography>
        <TextField
          select
          label={t("form.vehicle")}
          value={value.vehicleId}
          onChange={(e) => onChange({ vehicleId: e.target.value })}
          fullWidth
          sx={fieldSx}
        >
          <MenuItem value="">{t("form.noVehicle")}</MenuItem>
          {cars.map((car) => (
            <MenuItem key={car.id} value={car.id}>
              {car.name}
            </MenuItem>
          ))}
        </TextField>
        {numberField(
          "rangeKm",
          t("form.rangeKm"),
          value.vehicleId ? t("form.rangeOverrideHelper") : t("form.rangeHelper")
        )}
      </Stack>

      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: `1px solid ${UI.border2}`,
          borderRadius: 3,
          "&:before": { display: "none" },
          backgroundColor: "transparent",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 800, color: UI.text }}>
            {t("form.advanced")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1.75}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {numberField("startBatteryPercent", t("form.startBattery"))}
              {numberField("bufferPercent", t("form.buffer"))}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {numberField("chargeToPercent", t("form.chargeTo"))}
              {numberField("minPowerKW", t("form.minPower"))}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {numberField("maxDetourKm", t("form.maxDetour"))}
              {numberField("efficiencyKwhPer100Km", t("form.efficiency"))}
            </Stack>
            <Box>
              <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 700 }}>
                {t("form.connectors")}
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={value.connectorTypes}
                onChange={(_e, types) => toggleConnector(types as ConnectorType[])}
                sx={{ mt: 0.5, flexWrap: "wrap" }}
              >
                {CONNECTOR_OPTIONS.map((type) => (
                  <ToggleButton key={type} value={type} sx={{ textTransform: "none" }}>
                    {type}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {error ? (
        <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
          {error}
        </Typography>
      ) : null}

      <Button
        variant="contained"
        onClick={onPlan}
        disabled={planning}
        sx={{
          textTransform: "none",
          borderRadius: 3,
          background: UI.brandGrad,
          boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
        }}
      >
        {planning ? t("form.planning") : t("form.planTrip")}
      </Button>
    </Stack>
  );
}
