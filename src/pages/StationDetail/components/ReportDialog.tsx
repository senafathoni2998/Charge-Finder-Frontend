import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";

type ReportDialogProps = {
  open: boolean;
  onClose: () => void;
  reportType: string;
  reportNote: string;
  onReportTypeChange: (value: string) => void;
  onReportNoteChange: (value: string) => void;
  onSubmit: () => void;
  issueTypes: string[];
};

// Collects issue reports for station data quality.
export default function ReportDialog({
  open,
  onClose,
  reportType,
  reportNote,
  onReportTypeChange,
  onReportNoteChange,
  onSubmit,
  issueTypes,
}: ReportDialogProps) {
  const { t } = useTranslation("stationDetail");
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
      <DialogTitle sx={{ fontWeight: 950 }}>{t("reportDialog.title")}</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            {t("reportDialog.description")}
          </Typography>
          <TextField
            select
            label={t("reportDialog.issueType")}
            value={reportType}
            onChange={(event) => onReportTypeChange(event.target.value)}
            fullWidth
          >
            {issueTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t("reportDialog.notesLabel")}
            value={reportNote}
            onChange={(event) => onReportNoteChange(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder={t("reportDialog.notesPlaceholder")}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            borderColor: UI.border,
            color: UI.text,
          }}
        >
          {t("actions.cancel", { ns: "common" })}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          {t("reportDialog.submitReport")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
