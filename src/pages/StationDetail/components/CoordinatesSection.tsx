import { Skeleton, Stack } from "@mui/material";
import type { Station } from "../types";
import InfoRow from "./InfoRow";
import SectionCard from "./SectionCard";

type CoordinatesSectionProps = {
  loading: boolean;
  station: Station | null;
};

// Displays the station coordinates for debugging or navigation.
export default function CoordinatesSection({
  loading,
  station,
}: CoordinatesSectionProps) {
  return (
    <SectionCard title="Coordinates" subtitle="For debugging and precise navigation">
      {loading || !station ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={18} />
          <Skeleton variant="rounded" height={18} />
        </Stack>
      ) : (
        <Stack spacing={1.1}>
          <InfoRow label="Latitude" value={station.lat.toFixed(5)} />
          <InfoRow label="Longitude" value={station.lng.toFixed(5)} />
        </Stack>
      )}
    </SectionCard>
  );
}
