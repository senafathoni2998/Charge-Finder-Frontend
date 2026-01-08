import { Chip, Skeleton, Stack } from "@mui/material";
import { UI } from "../../../theme/theme";
import type { Station } from "../types";
import SectionCard from "./SectionCard";

type AmenitiesSectionProps = {
  loading: boolean;
  station: Station | null;
};

// Lists nearby amenities for the station.
export default function AmenitiesSection({
  loading,
  station,
}: AmenitiesSectionProps) {
  return (
    <SectionCard title="Amenities" subtitle="Helpful things near this station">
      {loading || !station ? (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" width={92} height={28} />
          ))}
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {station.amenities.map((amenity) => (
            <Chip
              key={amenity}
              label={amenity}
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
              }}
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
