import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import ConnectorChip from "./ConnectorChip";
import StatusChip from "./StatusChip";
import { minutesAgo } from "../../../utils/time";
import { resolveAssetUrl } from "../../../utils/assets";
import type { Connector } from "../../../models/model";
import type { StationWithDistance } from "../types";

type StationCardProps = {
  s: StationWithDistance;
  selectedId: string | null;
  focusStation: (station: StationWithDistance) => void;
};

const StationCard = ({ s, selectedId, focusStation }: StationCardProps) => {
  const { t } = useTranslation("mainPage");
  const thumbnailUrl = resolveAssetUrl(s.featuredImage);
  return (
    <Card
      variant="outlined"
      onClick={() => focusStation(s)}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        borderColor: selectedId === s.id ? "rgba(124,92,255,0.35)" : UI.border2,
        backgroundColor:
          selectedId === s.id ? "rgba(124,92,255,0.08)" : UI.surface,
        boxShadow:
          selectedId === s.id ? "none" : "0 10px 22px rgba(10,10,16,0.06)",
        transition:
          "transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: UI.border,
          boxShadow: "0 14px 26px rgba(10,10,16,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Stack direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
              {thumbnailUrl ? (
                <Box
                  component="img"
                  src={thumbnailUrl}
                  alt=""
                  sx={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    objectFit: "cover",
                    borderRadius: 2,
                    border: `1px solid ${UI.border2}`,
                  }}
                />
              ) : null}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{ fontWeight: 850, lineHeight: 1.1, color: UI.text }}
                >
                  {s.name}
                </Typography>
                <Typography variant="body2" sx={{ color: UI.text2 }}>
                  {s.address}
                </Typography>
              </Box>
            </Stack>
            <StatusChip status={s.status} isChargingHere={s.isChargingHere} />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {s.connectors.slice(0, 3).map((c: Connector, idx: number) => (
              <ConnectorChip key={idx} type={c.type} powerKW={c.powerKW} />
            ))}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {t("station.distanceAway", { distance: s.distanceKm.toFixed(1) })}
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              {t("station.updatedAgo", { minutes: minutesAgo(s.lastUpdatedISO) })}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

  export default   StationCard;
