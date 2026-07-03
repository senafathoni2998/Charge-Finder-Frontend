import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";

type AddCarHeaderProps = {
  title?: string;
  subtitle?: string;
};

// Renders the title and supporting copy for the car form flow.
export default function AddCarHeader({ title, subtitle }: AddCarHeaderProps) {
  const { t } = useTranslation("addCar");
  const resolvedTitle = title ?? t("header.title");
  const resolvedSubtitle = subtitle ?? t("header.subtitle");

  return (
    <Box>
      <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
        {resolvedTitle}
      </Typography>
      <Typography sx={{ color: UI.text2 }}>{resolvedSubtitle}</Typography>
    </Box>
  );
}
