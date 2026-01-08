import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import type { Station } from "../types";

type ShareDialogProps = {
  open: boolean;
  onClose: () => void;
  station: Station | null;
};

// Shows a fallback share dialog when native sharing is unavailable.
export default function ShareDialog({
  open,
  onClose,
  station,
}: ShareDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: UI.surface,
          border: `1px solid ${UI.border}`,
          color: UI.text,
          boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 950 }}>Share</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Typography variant="body2" sx={{ color: UI.text2 }}>
          Your browser doesn\u2019t support native share here. Copy the details
          manually.
        </Typography>
        <Box
          sx={{
            mt: 1.25,
            p: 1.5,
            borderRadius: 3,
            border: `1px dashed ${UI.border}`,
            backgroundColor: "rgba(10,10,16,0.02)",
          }}
        >
          <Typography sx={{ fontWeight: 900 }}>{station?.name ?? "\u2014"}</Typography>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            {station?.address ?? "\u2014"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
