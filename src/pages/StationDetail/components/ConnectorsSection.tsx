import { Skeleton, Stack } from "@mui/material";
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
  return (
    <SectionCard
      title="Connectors"
      subtitle="Compatibility + real\u2011time availability per connector type"
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
