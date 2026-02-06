import {
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";

export type ChargingHistoryItem = {
  id: string;
  endedAt: number | null;
  outcome: string | null;
  stationName: string;
  stationAddress: string;
  vehicleName: string;
  progressPercent: number | null;
  batteryPercentage: number | null;
  connectorType: string | null;
};

type ChargingHistoryCardProps = {
  items: ChargingHistoryItem[];
  loading?: boolean;
  error?: string | null;
};

const formatHistoryTime = (timestamp: number | null) => {
  if (!timestamp || !Number.isFinite(timestamp)) return "Unknown time";
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const outcomeLabel = (outcome: string | null) => {
  if (!outcome) return "Ended";
  const normalized = outcome.trim().toUpperCase();
  if (normalized === "COMPLETED") return "Completed";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "Cancelled";
  return outcome.trim();
};

const outcomeStyles = (outcome: string | null) => {
  const normalized = outcome?.trim().toUpperCase();
  if (normalized === "COMPLETED") {
    return {
      backgroundColor: "rgba(0,200,83,0.12)",
      borderColor: "rgba(0,200,83,0.35)",
    };
  }
  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return {
      backgroundColor: "rgba(244,67,54,0.12)",
      borderColor: "rgba(244,67,54,0.35)",
    };
  }
  return {
    backgroundColor: "rgba(10,10,16,0.06)",
    borderColor: UI.border2,
  };
};

// Shows the recent charging history for the signed-in driver.
export default function ChargingHistoryCard({
  items,
  loading = false,
  error,
}: ChargingHistoryCardProps) {
  const hasItems = items.length > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: { xs: 4, sm: 5 },
        borderColor: UI.border2,
        background: UI.surface,
        boxShadow: "0 20px 60px rgba(10,10,16,0.08)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: "0 24px 70px rgba(10,10,16,0.12)",
        },
      }}
    >
      <Box sx={{ height: { xs: 6, sm: 8 }, background: UI.brandGradStrong }} />
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: { xs: 17, sm: 18 } }}>
              Charging history
            </Typography>
            <Typography sx={{ color: UI.text2, fontSize: { xs: 13, sm: 14 } }}>
              Sessions from the last 3 days
            </Typography>
          </Box>

          {loading ? (
            <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
              <Skeleton variant="rounded" height={{ xs: 68, sm: 72 }} />
              <Skeleton variant="rounded" height={{ xs: 68, sm: 72 }} />
            </Stack>
          ) : error ? (
            <Box
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: { xs: 3, sm: 4 },
                border: `1.5px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: UI.text, fontSize: { xs: 15, sm: 16 } }}>
                Unable to load history
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5, fontSize: { xs: 13, sm: 14 } }}>
                {error}
              </Typography>
            </Box>
          ) : hasItems ? (
            <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
              {items.map((item) => {
                const progressLabel =
                  item.progressPercent != null
                    ? `Progress ${item.progressPercent}%`
                    : null;
                const batteryLabel =
                  item.batteryPercentage != null
                    ? `Battery ${item.batteryPercentage}%`
                    : null;
                const metaLabels = [
                  item.vehicleName ? `Vehicle: ${item.vehicleName}` : null,
                  item.connectorType ? `Connector: ${item.connectorType}` : null,
                  progressLabel,
                  batteryLabel,
                ].filter(Boolean) as string[];
                const label = outcomeLabel(item.outcome);
                const chipStyle = outcomeStyles(item.outcome);
                return (
                  <Box
                    key={item.id}
                    sx={{
                      p: { xs: 1.25, sm: 1.5 },
                      borderRadius: { xs: 3, sm: 4 },
                      border: `1px solid ${UI.border2}`,
                      backgroundColor: "rgba(10,10,16,0.01)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(10,10,16,0.02)",
                      },
                    }}
                  >
                    <Stack spacing={{ xs: 0.75, sm: 1 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ sm: "center" }}
                        spacing={{ xs: 0.75, sm: 1 }}
                      >
                        <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: { xs: 15, sm: 16 } }}>
                          {item.stationName || "Charging session"}
                        </Typography>
                        <Chip
                          size="small"
                          label={label}
                          sx={{
                            borderRadius: 999,
                            border: `1px solid ${chipStyle.borderColor}`,
                            backgroundColor: chipStyle.backgroundColor,
                            color: UI.text,
                            fontWeight: 800,
                            height: { xs: 24, sm: 26 },
                          }}
                        />
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="caption" sx={{ color: UI.text3, fontSize: { xs: 11, sm: 12 } }}>
                          {formatHistoryTime(item.endedAt)}
                        </Typography>
                      </Stack>
                      {item.stationAddress ? (
                        <Typography variant="body2" sx={{ color: UI.text2, fontSize: { xs: 13, sm: 14 } }}>
                          {item.stationAddress}
                        </Typography>
                      ) : null}
                      {metaLabels.length ? (
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
                          {metaLabels.map((meta) => (
                            <Chip
                              key={meta}
                              size="small"
                              label={meta}
                              sx={{
                                borderRadius: 999,
                                backgroundColor: "rgba(10,10,16,0.04)",
                                border: `1px solid ${UI.border2}`,
                                color: UI.text,
                                fontWeight: 700,
                                height: { xs: 22, sm: 24 },
                                fontSize: { xs: 11, sm: 12 },
                              }}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: { xs: 3, sm: 4 },
                border: `1.5px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text, fontSize: { xs: 15, sm: 16 } }}>
                No recent charging sessions
              </Typography>
              <Typography sx={{ color: UI.text2, mt: 0.5, fontSize: { xs: 13, sm: 14 } }}>
                Your last 3 days of charging will appear here
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
