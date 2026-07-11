import { useState } from "react";
import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { normalizeStop, type TripPlan } from "../../../api/trips";

type TripPlanResultProps = {
  plan: TripPlan;
  onSave: (name: string) => void;
  saving: boolean;
  saveError: string | null;
  saved: boolean;
};

const km = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? `${Math.round(v * 10) / 10} km` : "—";
const pct = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? `${Math.round(v)}%` : "—";

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 3,
        border: `1px solid ${UI.border2}`,
        backgroundColor: "rgba(10,10,16,0.02)",
        minWidth: 92,
      }}
    >
      <Typography variant="caption" sx={{ color: UI.text3, display: "block" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, color: UI.text }}>{value}</Typography>
    </Box>
  );
}

export default function TripPlanResult({
  plan,
  onSave,
  saving,
  saveError,
  saved,
}: TripPlanResultProps) {
  const { t } = useTranslation("trip");
  const [name, setName] = useState("");
  const stops = plan.stops.map(normalizeStop);

  return (
    <Stack spacing={2}>
      {/* Feasibility banner */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          p: 1.5,
          borderRadius: 3,
          border: `1px solid ${plan.feasible ? "rgba(46,125,50,0.3)" : "rgba(211,47,47,0.3)"}`,
          backgroundColor: plan.feasible
            ? "rgba(46,125,50,0.08)"
            : "rgba(211,47,47,0.08)",
        }}
      >
        {plan.feasible ? (
          <CheckCircleRoundedIcon sx={{ color: "#2e7d32" }} />
        ) : (
          <ErrorRoundedIcon sx={{ color: "#d32f2f" }} />
        )}
        <Box>
          <Typography sx={{ fontWeight: 900, color: UI.text }}>
            {plan.feasible
              ? t("result.feasible", { count: plan.totalStops })
              : t("result.infeasible")}
          </Typography>
          {!plan.feasible && plan.reason ? (
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {plan.reason}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      {/* Summary */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <SummaryChip label={t("result.directDistance")} value={km(plan.directDistanceKm)} />
        <SummaryChip label={t("result.totalDistance")} value={km(plan.totalDistanceKm)} />
        <SummaryChip label={t("result.stops")} value={String(plan.totalStops)} />
        <SummaryChip label={t("result.reserve")} value={km(plan.reserveKm)} />
        <SummaryChip label={t("result.usableStart")} value={km(plan.usableStartKm)} />
      </Stack>

      {/* Stops */}
      {stops.length > 0 ? (
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 800, color: UI.text }}>
            {t("result.chargingStops")}
          </Typography>
          {stops.map((stop, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${UI.border2}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: UI.brandGrad,
                    color: "white",
                    fontWeight: 900,
                    fontSize: 13,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography sx={{ fontWeight: 800, color: UI.text }}>
                      {stop.name ?? t("result.unnamedStation")}
                    </Typography>
                    {stop.connectorType ? (
                      <Chip
                        size="small"
                        icon={<BoltRoundedIcon />}
                        label={`${stop.connectorType}${
                          stop.powerKW ? ` · ${stop.powerKW} kW` : ""
                        }`}
                        sx={{
                          borderRadius: 999,
                          backgroundColor: "rgba(10,10,16,0.04)",
                          border: `1px solid ${UI.border2}`,
                          color: UI.text2,
                          fontWeight: 700,
                        }}
                      />
                    ) : null}
                  </Stack>
                  {stop.address ? (
                    <Typography variant="body2" sx={{ color: UI.text3 }}>
                      {stop.address}
                    </Typography>
                  ) : null}
                  <Typography variant="caption" sx={{ color: UI.text2, display: "block", mt: 0.5 }}>
                    {t("result.stopDistance", {
                      leg: km(stop.distanceFromPrevKm),
                      cumulative: km(stop.cumulativeKm),
                    })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: UI.text2 }}>
                    {t("result.stopBattery", {
                      arrival: pct(stop.arrivalBatteryPercent),
                      depart: pct(stop.departBatteryPercent),
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : plan.feasible ? (
        <Typography variant="body2" sx={{ color: UI.text2 }}>
          {t("result.noStopsNeeded")}
        </Typography>
      ) : null}

      {/* Save */}
      {plan.feasible ? (
        <Stack spacing={1}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
            <TextField
              size="small"
              label={t("result.tripName")}
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 120))}
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <Button
              variant="outlined"
              onClick={() => onSave(name)}
              disabled={saving}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                whiteSpace: "nowrap",
              }}
            >
              {saving ? t("result.saving") : t("result.saveTrip")}
            </Button>
          </Stack>
          {saved ? (
            <Typography variant="caption" sx={{ color: "#2e7d32", fontWeight: 700 }}>
              {t("result.saved")}
            </Typography>
          ) : null}
          {saveError ? (
            <Typography variant="caption" sx={{ color: "rgba(244,67,54,0.9)" }}>
              {saveError}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
