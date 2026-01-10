import { Box, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

type AddCarHeaderProps = {
  title?: string;
  subtitle?: string;
};

// Renders the title and supporting copy for the car form flow.
export default function AddCarHeader({
  title = "Add a car",
  subtitle = "Save your connector types to personalize compatible stations.",
}: AddCarHeaderProps) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 950, color: UI.text, fontSize: 28 }}>
        {title}
      </Typography>
      <Typography sx={{ color: UI.text2 }}>{subtitle}</Typography>
    </Box>
  );
}
