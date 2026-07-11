import { Box, Button, Chip, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { SavedTrip, TripPoint } from "../../../api/trips";

type SavedTripsListProps = {
  trips: SavedTrip[];
  loading: boolean;
  onLoad: (trip: SavedTrip) => void;
  onDelete: (tripId: string) => void;
};

const pointLabel = (point: TripPoint): string =>
  point.label ?? `${point.lat.toFixed(3)}, ${point.lng.toFixed(3)}`;

const km = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? `${Math.round(v)} km` : "—";

export default function SavedTripsList({
  trips,
  loading,
  onLoad,
  onDelete,
}: SavedTripsListProps) {
  const { t } = useTranslation("trip");

  if (loading) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={64} />
        <Skeleton variant="rounded" height={64} />
      </Stack>
    );
  }

  if (trips.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: UI.text2 }}>
        {t("saved.empty")}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.25}>
      {trips.map((trip) => (
        <Box
          key={trip.id}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: `1px solid ${UI.border2}`,
            backgroundColor: "rgba(10,10,16,0.02)",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography sx={{ fontWeight: 850, color: UI.text }}>
                  {trip.name || t("saved.untitled")}
                </Typography>
                <Chip
                  size="small"
                  label={
                    trip.feasible ? t("saved.feasible") : t("saved.infeasible")
                  }
                  sx={{
                    borderRadius: 999,
                    fontWeight: 800,
                    color: trip.feasible ? "#2e7d32" : "#d32f2f",
                    backgroundColor: trip.feasible
                      ? "rgba(46,125,50,0.08)"
                      : "rgba(211,47,47,0.08)",
                    border: `1px solid ${
                      trip.feasible ? "rgba(46,125,50,0.3)" : "rgba(211,47,47,0.3)"
                    }`,
                  }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: UI.text2, mt: 0.25 }}>
                {pointLabel(trip.origin)} → {pointLabel(trip.destination)}
              </Typography>
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                {t("saved.summary", {
                  distance: km(trip.totalDistanceKm ?? trip.directDistanceKm),
                  stops: trip.totalStops ?? 0,
                })}
              </Typography>
            </Box>
            <IconButton
              size="small"
              aria-label={t("saved.delete")}
              onClick={() => onDelete(trip.id)}
              sx={{ borderRadius: 2, border: `1px solid ${UI.border2}` }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Button
            size="small"
            variant="text"
            onClick={() => onLoad(trip)}
            sx={{ textTransform: "none", borderRadius: 3, color: UI.text2, mt: 0.5 }}
          >
            {t("saved.loadIntoPlanner")}
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
