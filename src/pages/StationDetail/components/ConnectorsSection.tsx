import { Skeleton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Station } from "../types";
import ConnectorRow from "./ConnectorRow";
import SectionCard from "./SectionCard";

type ConnectorsSectionProps = {
  loading: boolean;
  station: Station | null;
};

// Shows connector availability for the selected station.
export default function ConnectorsSection({
  loading,
  station,
}: ConnectorsSectionProps) {
  const { t } = useTranslation("stationDetail");
  return (
    <SectionCard
      title={t("connectors.title")}
      subtitle={t("connectors.subtitle")}
    >
      {loading || !station ? (
        <Stack spacing={1.2}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={72} />
        </Stack>
      ) : (
        <Stack spacing={1.2}>
          {station.connectors.map((connector) => (
            <ConnectorRow key={connector.type} c={connector} />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
