import { Box, Button, Stack } from "@mui/material";
import { UI } from "../../../theme/theme";

type AddCarActionsProps = {
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
};

// Renders the primary and secondary actions for the car form.
export default function AddCarActions({
  isSubmitting,
  onCancel,
  submitLabel = "Save car",
  submittingLabel = "Saving...",
}: AddCarActionsProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
      <Button
        variant="outlined"
        onClick={onCancel}
        sx={{
          textTransform: "none",
          borderRadius: 3,
          borderColor: UI.border,
          color: UI.text,
          backgroundColor: "rgba(10,10,16,0.01)",
        }}
      >
        Cancel
      </Button>
      <Box sx={{ flex: 1 }} />
      <Button
        variant="contained"
        type="submit"
        disabled={isSubmitting}
        sx={{
          textTransform: "none",
          borderRadius: 3,
          background: UI.brandGradStrong,
          color: "white",
        }}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </Stack>
  );
}
