import { Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: UI.text3, fontWeight: 750 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: UI.text, fontWeight: 900 }}>
        {value}
      </Typography>
    </Stack>
  );
};

export default InfoRow;
