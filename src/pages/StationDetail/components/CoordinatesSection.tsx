import { Skeleton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("stationDetail");
  return (
    <SectionCard title={t("coordinates.title")} subtitle={t("coordinates.subtitle")}>
      {loading || !station ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={18} />
          <Skeleton variant="rounded" height={18} />
        </Stack>
      ) : (
        <Stack spacing={1.1}>
          <InfoRow label={t("coordinates.latitude")} value={station.lat.toFixed(5)} />
          <InfoRow label={t("coordinates.longitude")} value={station.lng.toFixed(5)} />
        </Stack>
      )}
    </SectionCard>
  );
}
