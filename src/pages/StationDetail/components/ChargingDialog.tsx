import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import type { ChargingStatus, Ticket } from "../types";

// ============================================================================
// CONSTANTS
// ============================================================================

const DIALOG_PAPER_SX = {
  borderRadius: 4,
  backgroundColor: UI.surface,
  border: `1px solid ${UI.border}`,
  color: UI.text,
  boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
};

const PROGRESS_SECTION_SX = {
  p: 1.5,
  borderRadius: 3,
  border: `1px solid ${UI.border2}`,
  backgroundColor: "rgba(10,10,16,0.02)",
};

const TICKET_SECTION_SX = {
  p: 1.25,
  borderRadius: 3,
  border: `1px dashed ${UI.border}`,
  backgroundColor: "rgba(10,10,16,0.02)",
};

// ============================================================================
// TYPES
// ============================================================================

/** Dialog state controls the open/closed state and stop action */
export interface ChargingDialogState {
  open: boolean;
  onClose: () => void;
  onStop: () => void;
}

/** Charging progress contains all real-time charging data */
export interface ChargingProgressData {
  status: ChargingStatus;
  cancelled?: boolean;
  progress: number;
  displayProgress?: number;
  ticket: Ticket | null;
  ticketKwh: number;
  deliveredKwh: number;
  remainingMinutes: number;
  estimatedRemainingMinutes?: number | null;
}

/**
 * All props for the ChargingDialog component, grouped by domain.
 *
 * Usage example:
 * ```tsx
 * <ChargingDialog
 *   dialogState={{ open, onClose, onStop }}
 *   chargingProgress={{ status, cancelled, progress, ... }}
 * />
 * ```
 */
export interface ChargingDialogProps {
  dialogState: ChargingDialogState;
  chargingProgress: ChargingProgressData;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/** Progress bar showing charging completion percentage */
function ChargingProgressBar({
  progress,
  deliveredKwh,
  ticketKwh,
  remainingMinutes,
  isDone,
}: {
  progress: number;
  deliveredKwh: number;
  ticketKwh: number;
  remainingMinutes: number;
  isDone: boolean;
}) {
  return (
    <Box sx={PROGRESS_SECTION_SX}>
      <Stack spacing={1}>
        {/* Header: progress % and delivered kWh */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ fontWeight: 900, color: UI.text }}>
            Battery {progress}%
          </Typography>
          {!isDone && (
            <Typography variant="caption" sx={{ color: UI.text2 }}>
              {deliveredKwh} / {ticketKwh} kWh
            </Typography>
          )}
        </Stack>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 999,
            backgroundColor: "rgba(10,10,16,0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: UI.brandGradStrong,
            },
          }}
        />

        {/* Time remaining message */}
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          {isDone
            ? "Charging complete."
            : `Estimated time remaining: ${
                remainingMinutes || ""
              } ${remainingMinutes > 0 ? "min" : ""} `}
        </Typography>
      </Stack>
    </Box>
  );
}

/** Section displaying ticket information */
function TicketInfo({ ticket }: { ticket: Ticket }) {
  return (
    <Box sx={TICKET_SECTION_SX}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          Ticket ID
        </Typography>
        <Chip
          size="small"
          label={ticket.id}
          sx={{
            borderRadius: 999,
            backgroundColor: "rgba(10,10,16,0.04)",
            border: `1px solid ${UI.border2}`,
            color: UI.text,
            fontWeight: 800,
          }}
        />
      </Stack>
      <Typography variant="body2" sx={{ color: UI.text2, mt: 0.75 }}>
        Paid with {ticket.methodLabel}
      </Typography>
    </Box>
  );
}

/** Confirmation dialog for stopping a charging session */
function StopConfirmDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: DIALOG_PAPER_SX }}
    >
      <DialogTitle sx={{ fontWeight: 950 }}>Stop charging?</DialogTitle>
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            Stopping ends this session and the ticket cannot be reused.
          </Typography>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            You will need to buy a new ticket to charge again.
          </Typography>
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
          Keep charging
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            borderRadius: 3,
          }}
        >
          Stop charging
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ChargingDialog - Renders the live charging progress dialog.
 */
export default function ChargingDialog(props: ChargingDialogProps) {
  // ===== EXTRACT PROPS =====
  const { dialogState, chargingProgress } = props;

  // Dialog state
  const { open, onClose, onStop } = dialogState;

  // Charging progress data
  const {
    status: chargingStatus,
    cancelled: chargingCancelled = false,
    progress: chargingProgressValue,
    displayProgress,
    ticket,
    ticketKwh,
    deliveredKwh,
    remainingMinutes,
    estimatedRemainingMinutes,
  } = chargingProgress;

  // ===== DERIVED STATE =====
  const isCharging = chargingStatus === "charging";
  const isDone = chargingStatus === "done";
  const isCancelled = isDone && chargingCancelled;

  const progressPercent =
    typeof displayProgress === "number" && Number.isFinite(displayProgress)
      ? displayProgress
      : chargingProgressValue;

  const effectiveRemainingMinutes =
    typeof estimatedRemainingMinutes === "number" &&
    Number.isFinite(estimatedRemainingMinutes)
      ? Math.max(0, estimatedRemainingMinutes)
      : remainingMinutes;

  const dialogTitle = isCancelled
    ? "Charging stopped"
    : isDone
    ? "Charging complete"
    : "Charging in progress";

  const statusMessage = isCancelled
    ? "Charging stopped. You can unplug when it is safe."
    : isDone
    ? "Session complete. You can unplug when it is safe."
    : "Keep the connector plugged in while we deliver your ticket.";

  // ===== STOP CONFIRMATION STATE =====
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);

  useEffect(() => {
    if (!open || !isCharging) {
      setConfirmStopOpen(false);
    }
  }, [open, isCharging]);

  const handleStopRequest = () => setConfirmStopOpen(true);
  const handleConfirmStop = () => {
    setConfirmStopOpen(false);
    onStop();
  };

  // ===== RENDER =====
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: DIALOG_PAPER_SX }}
    >
      {/* ===== DIALOG TITLE ===== */}
      <DialogTitle sx={{ fontWeight: 950 }}>{dialogTitle}</DialogTitle>

      {/* ===== DIALOG CONTENT ===== */}
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: UI.text2 }}>
            {statusMessage}
          </Typography>

          {/* Progress bar */}
          <ChargingProgressBar
            progress={progressPercent}
            deliveredKwh={deliveredKwh}
            ticketKwh={ticketKwh}
            remainingMinutes={effectiveRemainingMinutes}
            isDone={isDone}
          />

          {/* Ticket info */}
          {ticket && <TicketInfo ticket={ticket} />}
        </Stack>
      </DialogContent>

      {/* ===== DIALOG ACTIONS ===== */}
      <DialogActions sx={{ p: 2 }}>
        {isCharging ? (
          <>
            <Button
              variant="outlined"
              onClick={handleStopRequest}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
              }}
            >
              Stop charging
            </Button>
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
              Hide
            </Button>
          </>
        ) : (
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
        )}
      </DialogActions>

      {/* ===== STOP CONFIRMATION DIALOG ===== */}
      <StopConfirmDialog
        open={confirmStopOpen}
        onClose={() => setConfirmStopOpen(false)}
        onConfirm={handleConfirmStop}
      />
    </Dialog>
  );
}
