import { useTranslation } from "react-i18next";
import { CONNECTOR_OPTIONS } from "../../MainPage/constants";
import type { StationFormValues } from "../../../forms/schemas";
import StationFormCard, {
  type StationImageSelection,
} from "../../AddStation/components/StationFormCard";
import EditStationHeader from "./EditStationHeader";

type EditStationFormSectionProps = {
  defaultValues: StationFormValues;
  initialImageUrl?: string | null;
  serverError: string | null;
  onSubmit: (
    values: StationFormValues,
    image: StationImageSelection
  ) => void | Promise<void>;
  onCancel: () => void;
};

// Renders the edit-station header with the shared react-hook-form card.
export default function EditStationFormSection({
  defaultValues,
  initialImageUrl = null,
  serverError,
  onSubmit,
  onCancel,
}: EditStationFormSectionProps) {
  const { t } = useTranslation("editStation");
  const defaultConnectorType = CONNECTOR_OPTIONS[0] ?? "CCS2";
  return (
    <>
      <EditStationHeader />
      <StationFormCard
        defaultValues={defaultValues}
        connectorOptions={CONNECTOR_OPTIONS}
        defaultConnectorType={defaultConnectorType}
        initialImageUrl={initialImageUrl}
        serverError={serverError}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel={t("form.submit")}
        submittingLabel={t("form.submitting")}
      />
    </>
  );
}
