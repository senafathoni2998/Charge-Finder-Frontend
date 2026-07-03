import type { MouseEvent } from "react";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Station } from "../../../models/model";
import { UI } from "../../../theme/theme";
import StationListItem from "./StationListItem";

type StationListProps = {
  stations: Station[];
  allStationsCount: number;
  isLoading: boolean;
  error: string | null;
  onOpenMenu: (event: MouseEvent<HTMLElement>, station: Station) => void;
};

// Displays the station list, loading state, or empty message.
export default function StationList({
  stations,
  allStationsCount,
  isLoading,
  error,
  onOpenMenu,
}: StationListProps) {
  const { t } = useTranslation("admin");

  if (isLoading) {
    return (
      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
        {t("stationList.loading")}
      </Typography>
    );
  }

  if (!stations.length) {
    return (
      <Typography sx={{ color: UI.text2, fontSize: 14 }}>
        {error ||
          (allStationsCount
            ? t("stationList.emptyFiltered")
            : t("stationList.empty"))}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {stations.map((station) => (
        <StationListItem
          key={station.id}
          station={station}
          onOpenMenu={onOpenMenu}
        />
      ))}
    </Stack>
  );
}
