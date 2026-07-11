import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { CONNECTOR_OPTIONS } from "../MainPage/constants";
import type { StationFormValues } from "../../forms/schemas";
import type { StationImageSelection } from "../AddStation/components/StationFormCard";
import { resolveAssetUrl } from "../../utils/assets";
import { updateStationRequest } from "./editStationRoute";
import { buildEditStationDefaults } from "./utils";
import EditStationFormSection from "./components/EditStationFormSection";
import EditStationLayout from "./components/EditStationLayout";
import EditStationLoadingState from "./components/EditStationLoadingState";
import EditStationNotFoundState from "./components/EditStationNotFoundState";
import useEditStationLoader from "./hooks/useEditStationLoader";

// Edit station page: loads the station, owns the submit side-effect + navigation.
// The form state lives in StationFormCard (react-hook-form).
export default function EditStationPage() {
  const navigate = useNavigate();
  const { stationId } = useParams();
  const { t } = useTranslation("editStation");
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultConnectorType = CONNECTOR_OPTIONS[0] ?? "CCS2";
  const { station, loading, error } = useEditStationLoader(stationId);

  // Navigates back to the admin dashboard.
  const handleBackToAdmin = () => {
    navigate("/admin");
  };

  const handleSubmit = async (
    values: StationFormValues,
    image: StationImageSelection
  ) => {
    if (!station) return;
    setServerError(null);
    const result = await updateStationRequest(station.id, values, image, t);
    if (result.ok) {
      navigate("/admin");
      return;
    }
    setServerError(result.error);
  };

  if (loading) {
    return (
      <EditStationLayout>
        <EditStationLoadingState />
      </EditStationLayout>
    );
  }

  if (!station) {
    return (
      <EditStationLayout>
        <EditStationNotFoundState
          errorMessage={error}
          onBack={handleBackToAdmin}
        />
      </EditStationLayout>
    );
  }

  return (
    <EditStationLayout>
      <EditStationFormSection
        key={station.id}
        defaultValues={buildEditStationDefaults(station, defaultConnectorType)}
        initialImageUrl={resolveAssetUrl(station.featuredImage)}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={handleBackToAdmin}
      />
    </EditStationLayout>
  );
}
