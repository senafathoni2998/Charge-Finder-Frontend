import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import EditStationHeader from "./EditStationHeader";

// Shows a loading placeholder while station data is fetched.
export default function EditStationLoadingState() {
  const { t } = useTranslation("editStation");
  return (
    <>
      <EditStationHeader subtitle={t("loading.subtitle")} />
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px dashed ${UI.border}`,
          backgroundColor: "rgba(10,10,16,0.02)",
        }}
      >
        <Typography sx={{ fontWeight: 900, color: UI.text }}>
          {t("loading.message")}
        </Typography>
      </Box>
    </>
  );
}
