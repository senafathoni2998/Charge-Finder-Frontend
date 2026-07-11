import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { Station } from "../types";
import ConnectorRow from "./ConnectorRow";
import SectionCard from "./SectionCard";
import { useStationAvailability } from "../hooks/useStationAvailability";

type ConnectorsSectionProps = {
  loading: boolean;
  station: Station | null;
};

// A small pulsing "Live" pill shown once availability polling is active.
function LiveIndicator() {
  const { t } = useTranslation("stationDetail");
  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 999,
        border: "1px solid rgba(46,125,50,0.3)",
        backgroundColor: "rgba(46,125,50,0.08)",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#2e7d32",
          animation: "cfLivePulse 1.6s ease-in-out infinite",
          "@keyframes cfLivePulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.3 },
          },
        }}
      />
      <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 800 }}>
        {t("connectors.live")}
      </Typography>
    </Stack>
  );
}

// Shows live connector availability for the selected station. Availability is
// polled from the uncached endpoint (useStationAvailability) and overlaid on the
// station's connectors; before the first poll it falls back to the loaded station.
export default function ConnectorsSection({
  loading,
  station,
}: ConnectorsSectionProps) {
  const { t } = useTranslation("stationDetail");
  const availability = useStationAvailability(station?.id);
  const connectors = availability.connectors ?? station?.connectors ?? [];

  return (
    <SectionCard
      title={t("connectors.title")}
      subtitle={t("connectors.subtitle")}
      right={
        !loading && station && availability.live ? <LiveIndicator /> : undefined
      }
    >
      {loading || !station ? (
        <Stack spacing={1.2}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={72} />
        </Stack>
      ) : (
        <Stack spacing={1.2}>
          {connectors.map((connector) => (
            <ConnectorRow key={connector.type} c={connector} />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
