import { Chip, Skeleton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("stationDetail");
  return (
    <SectionCard title={t("amenities.title")} subtitle={t("amenities.subtitle")}>
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
