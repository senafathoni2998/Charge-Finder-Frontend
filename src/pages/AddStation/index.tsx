import { useState } from "react";
import { Box, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { UI } from "../../theme/theme";
import { CONNECTOR_OPTIONS } from "../MainPage/constants";
import type { StationFormValues } from "../../forms/schemas";
import { createStationRequest } from "./addStationRoute";
import { createEmptyStationDefaults } from "./stationFormUtils";
import StationHeader from "./components/StationHeader";
import StationFormCard, {
  type StationImageSelection,
} from "./components/StationFormCard";

// Add station page: owns the submit side-effect + navigation. The form state lives
// in StationFormCard (react-hook-form).
export default function AddStationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("addStation");
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultConnectorType = CONNECTOR_OPTIONS[0] ?? "CCS2";
  const [defaultValues] = useState<StationFormValues>(() =>
    createEmptyStationDefaults(defaultConnectorType)
  );

  const handleSubmit = async (
    values: StationFormValues,
    image: StationImageSelection
  ) => {
    setServerError(null);
    const result = await createStationRequest(
      values,
      image.file,
      t("errors.createStation")
    );
    if (result.ok) {
      navigate("/admin");
      return;
    }
    setServerError(result.error);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100dvh - 64px)",
        backgroundColor: UI.bg,
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Stack spacing={2.5}>
          <StationHeader />
          <StationFormCard
            defaultValues={defaultValues}
            connectorOptions={CONNECTOR_OPTIONS}
            defaultConnectorType={defaultConnectorType}
            serverError={serverError}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin")}
            submitLabel={t("actions.createStation")}
            submittingLabel={t("actions.creating")}
          />
        </Stack>
      </Box>
    </Box>
  );
}
