import { Box, Stack, Typography, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Connector } from "../../../models/model";
import { UI } from "../../../theme/theme";

// Availability accent colors (kept local — the theme has no semantic tokens).
const FREE_COLOR = "#2e7d32";
const FULL_COLOR = "#d32f2f";

const ConnectorRow = ({ c }: { c: Connector }) => {
  const { t } = useTranslation("stationDetail");
  const total = Math.max(0, c.ports ?? 0);
  const free = Math.min(Math.max(0, c.availablePorts ?? 0), total);
  const inUse = Math.max(0, total - free);
  const isFull = total > 0 && free <= 0;
  const pct = total ? Math.round((free / total) * 100) : 0;
  const accent = isFull ? FULL_COLOR : FREE_COLOR;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${UI.border2}`,
        backgroundColor: "rgba(10,10,16,0.02)",
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Free/occupied status dot */}
            <Box
              aria-hidden
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: accent,
                boxShadow: `0 0 0 3px ${accent}22`,
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontWeight: 900, color: UI.text }}>
              {c.type}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={`${c.powerKW} kW`}
            sx={{
              borderRadius: 999,
              backgroundColor: "rgba(10,10,16,0.04)",
              border: `1px solid ${UI.border2}`,
              color: UI.text2,
              fontWeight: 750,
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 999,
              backgroundColor: "rgba(10,10,16,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${pct}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: accent,
                transition: "width 300ms ease, background-color 300ms ease",
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: isFull ? FULL_COLOR : UI.text2, fontWeight: 800 }}
          >
            {isFull
              ? t("connectors.full")
              : t("connectors.available", { available: free, total })}
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: UI.text3 }}>
          {t("connectors.freeInUse", { free, inUse })}
        </Typography>
      </Stack>
    </Box>
  );
};

export default ConnectorRow;
