import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";

type StationHeaderProps = {
  title?: string;
  subtitle?: string;
};

// Renders the title and supporting copy for the station form flow.
export default function StationHeader({ title, subtitle }: StationHeaderProps) {
  const { t } = useTranslation("addStation");
  return (
    <Box>
      <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
        {title ?? t("header.title")}
      </Typography>
      <Typography sx={{ color: UI.text2 }}>
        {subtitle ?? t("header.subtitle")}
      </Typography>
    </Box>
  );
}
