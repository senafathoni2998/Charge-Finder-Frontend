import { useTranslation } from "react-i18next";
import StationHeader from "../../AddStation/components/StationHeader";

type EditStationHeaderProps = {
  subtitle?: string;
};

// Renders the shared header for the edit-station flow.
export default function EditStationHeader({
  subtitle,
}: EditStationHeaderProps) {
  const { t } = useTranslation("editStation");
  return (
    <StationHeader
      title={t("header.title")}
      subtitle={subtitle ?? t("header.subtitle")}
    />
  );
}
