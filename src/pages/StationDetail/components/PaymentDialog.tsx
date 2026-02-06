import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { UI } from "../../../theme/theme";
import { formatCurrency } from "../../../utils/distance";
import type { PaymentMethod } from "../types";
import type { ChargingSpeed } from "../../../models/model";
import InfoRow from "./InfoRow";

// ============================================================================
// CONSTANTS
// ============================================================================

const SPEED_OPTIONS: Array<{
  value: ChargingSpeed;
  label: string;
  helper: string;
}> = [
  { value: "NORMAL", label: "Normal", helper: "Standard charging speed." },
  { value: "FAST", label: "Fast", helper: "Higher power delivery." },
  { value: "ULTRA_FAST", label: "Ultra fast", helper: "Highest power option." },
];

const INFO_SECTION_SX = {
  p: 1.25,
  borderRadius: 3,
  border: `1px solid ${UI.border2}`,
  backgroundColor: "rgba(10,10,16,0.02)",
};

const DIALOG_PAPER_SX = {
  borderRadius: 4,
  backgroundColor: UI.surface,
  border: `1px solid ${UI.border}`,
  color: UI.text,
  boxShadow: "0 24px 70px rgba(10,10,16,0.18)",
};

// ============================================================================
// TYPES
// ============================================================================

/** Dialog state controls the open/closed state and submission behavior */
export interface PaymentDialogState {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  canSubmit: boolean;
  hasTicket: boolean;
  submitError?: string | null;
  isSubmitting?: boolean;
}

/** Ticket configuration contains all ticket-related settings and handlers */
export interface PaymentTicketConfig {
  ticketKwh: number;
  ticketKwhInput: string;
  ticketKwhSuggested: number;
  ticketKwhValid: boolean;
  onTicketKwhChange: (value: string) => void;
  chargingSpeed: ChargingSpeed;
  onChargingSpeedChange: (value: ChargingSpeed) => void;
}

/** Pricing information for displaying ticket costs */
export interface PaymentPricing {
  pricePerKwh: number | null;
  currency: string | null;
  ticketPriceLabel: string;
}

/** Payment method selection state and handlers */
export interface PaymentSelection {
  selectedPaymentId: string;
  onPaymentChange: (value: string) => void;
  paymentMethods: PaymentMethod[];
}

/**
 * All props for the PaymentDialog component, grouped by domain.
 *
 * Usage example:
 * ```tsx
 * <PaymentDialog
 *   dialogState={{ open, onClose, onConfirm, canSubmit, hasTicket, submitError, isSubmitting }}
 *   ticketConfig={{ ticketKwh, ticketKwhInput, ... }}
 *   pricing={{ pricePerKwh, currency, ticketPriceLabel }}
 *   paymentSelection={{ selectedPaymentId, onPaymentChange, paymentMethods }}
 * />
 * ```
 */
export interface PaymentDialogProps {
  dialogState: PaymentDialogState;
  ticketConfig: PaymentTicketConfig;
  pricing: PaymentPricing;
  paymentSelection: PaymentSelection;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/** Radio button option for charging speed selection */
function SpeedOption({
  value,
  label,
  helper,
  isSelected,
  onSelect,
}: {
  value: ChargingSpeed;
  label: string;
  helper: string;
  isSelected: boolean;
  onSelect: (value: ChargingSpeed) => void;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${
          isSelected ? "rgba(0,229,255,0.35)" : UI.border2
        }`,
        backgroundColor: isSelected
          ? "rgba(0,229,255,0.08)"
          : "rgba(10,10,16,0.02)",
      }}
    >
      <FormControlLabel
        value={value}
        control={
          <Radio
            sx={{
              color: UI.text3,
              "&.Mui-checked": { color: UI.text },
            }}
          />
        }
        label={
          <Box>
            <Typography sx={{ fontWeight: 800, color: UI.text }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              {helper}
            </Typography>
          </Box>
        }
        sx={{ alignItems: "flex-start", m: 0 }}
        onChange={() => onSelect(value)}
      />
    </Box>
  );
}

/** Radio button option for payment method selection */
function PaymentMethodOption({
  id,
  label,
  helper,
  isSelected,
  onSelect,
}: {
  id: string;
  label: string;
  helper: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 3,
        border: `1px solid ${
          isSelected ? "rgba(0,229,255,0.35)" : UI.border2
        }`,
        backgroundColor: isSelected
          ? "rgba(0,229,255,0.08)"
          : "rgba(10,10,16,0.02)",
      }}
    >
      <FormControlLabel
        value={id}
        control={
          <Radio
            sx={{
              color: UI.text3,
              "&.Mui-checked": { color: UI.text },
            }}
          />
        }
        label={
          <Box>
            <Typography sx={{ fontWeight: 800, color: UI.text }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              {helper}
            </Typography>
          </Box>
        }
        sx={{ alignItems: "flex-start", m: 0 }}
        onChange={() => onSelect(id)}
      />
    </Box>
  );
}

/** Section for configuring ticket size and charging speed */
function TicketSetupSection({
  ticketKwhInput,
  ticketKwhSuggested,
  ticketKwhValid,
  onTicketKwhChange,
  chargingSpeed,
  onChargingSpeedChange,
}: {
  ticketKwhInput: string;
  ticketKwhSuggested: number;
  ticketKwhValid: boolean;
  onTicketKwhChange: (value: string) => void;
  chargingSpeed: ChargingSpeed;
  onChargingSpeedChange: (value: ChargingSpeed) => void;
}) {
  const hasInput = ticketKwhInput.trim().length > 0;

  return (
    <Box sx={INFO_SECTION_SX}>
      <Stack spacing={1.25}>
        <Typography
          variant="subtitle2"
          sx={{ color: UI.text, fontWeight: 800, letterSpacing: 0.3 }}
        >
          Ticket setup
        </Typography>

        {/* Ticket size input */}
        <TextField
          label="Ticket size (kWh)"
          type="number"
          value={ticketKwhInput}
          onChange={(event) => onTicketKwhChange(event.target.value)}
          inputProps={{ min: 1, step: 0.1 }}
          error={!ticketKwhValid}
          helperText={
            !ticketKwhValid
              ? "Enter a valid kWh amount."
              : !hasInput
              ? `Suggested: ${ticketKwhSuggested} kWh`
              : " "
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(10,10,16,0.02)",
            },
          }}
        />

        {/* Charging speed selection */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: UI.text2, fontWeight: 800, letterSpacing: 0.2 }}
          >
            Charging speed
          </Typography>
          <RadioGroup
            value={chargingSpeed}
            onChange={(event) =>
              onChargingSpeedChange(event.target.value as ChargingSpeed)
            }
            sx={{ gap: 1, mt: 1 }}
          >
            {SPEED_OPTIONS.map((option) => (
              <SpeedOption
                key={option.value}
                value={option.value}
                label={option.label}
                helper={option.helper}
                isSelected={chargingSpeed === option.value}
                onSelect={onChargingSpeedChange}
              />
            ))}
          </RadioGroup>
        </Box>
      </Stack>
    </Box>
  );
}

/** Section displaying ticket details and pricing summary */
function TicketDetailsSection({
  ticketKwh,
  chargingSpeed,
  pricePerKwh,
  currency,
  ticketPriceLabel,
}: {
  ticketKwh: number;
  chargingSpeed: ChargingSpeed;
  pricePerKwh: number | null;
  currency: string | null;
  ticketPriceLabel: string;
}) {
  const perKwhLabel =
    Number.isFinite(pricePerKwh) && currency
      ? formatCurrency(currency, Number(pricePerKwh))
      : "—";

  const speedLabel =
    SPEED_OPTIONS.find((option) => option.value === chargingSpeed)?.label ??
    "Normal";

  return (
    <Box sx={INFO_SECTION_SX}>
      <Stack spacing={0.75}>
        <Typography
          variant="subtitle2"
          sx={{ color: UI.text, fontWeight: 800, letterSpacing: 0.3 }}
        >
          Ticket details
        </Typography>
        <InfoRow label="Ticket size" value={`${ticketKwh} kWh`} />
        <InfoRow label="Speed" value={speedLabel} />
        <InfoRow label="Per kWh" value={perKwhLabel} />
        <InfoRow label="Total" value={ticketPriceLabel} />
        <Typography variant="caption" sx={{ color: UI.text3 }}>
          Price based on station rate.
        </Typography>
      </Stack>
    </Box>
  );
}

/** Section for selecting payment method */
function PaymentMethodSection({
  selectedPaymentId,
  paymentMethods,
  onPaymentChange,
}: {
  selectedPaymentId: string;
  paymentMethods: PaymentMethod[];
  onPaymentChange: (value: string) => void;
}) {
  return (
    <Box sx={INFO_SECTION_SX}>
      <Stack spacing={1}>
        <Typography
          variant="subtitle2"
          sx={{ color: UI.text, fontWeight: 800, letterSpacing: 0.3 }}
        >
          Payment method
        </Typography>
        <RadioGroup
          value={selectedPaymentId}
          onChange={(event) => onPaymentChange(event.target.value)}
          sx={{ gap: 1 }}
        >
          {paymentMethods.map((method) => (
            <PaymentMethodOption
              key={method.id}
              id={method.id}
              label={method.label}
              helper={method.helper}
              isSelected={selectedPaymentId === method.id}
              onSelect={onPaymentChange}
            />
          ))}
        </RadioGroup>
      </Stack>
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentDialog - Dialog for purchasing or updating a charging ticket.
 */
export default function PaymentDialog(props: PaymentDialogProps) {
  // ===== EXTRACT PROPS =====
  const { dialogState, ticketConfig, pricing, paymentSelection } = props;

  // Dialog state
  const { open, onClose, onConfirm, canSubmit, hasTicket, submitError, isSubmitting = false } = dialogState;

  // Ticket config
  const { ticketKwh, ticketKwhInput, ticketKwhSuggested, ticketKwhValid, onTicketKwhChange, chargingSpeed, onChargingSpeedChange } = ticketConfig;

  // Pricing
  const { pricePerKwh, currency, ticketPriceLabel } = pricing;

  // Payment selection
  const { selectedPaymentId, onPaymentChange, paymentMethods } = paymentSelection;

  // ===== DERIVED VALUES =====
  const confirmLabel = isSubmitting
    ? "Processing..."
    : hasTicket
    ? "Update payment"
    : "Buy ticket";

  const isFormDisabled = !canSubmit || isSubmitting || !ticketKwhValid;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: DIALOG_PAPER_SX }}
    >
      {/* ===== DIALOG HEADER ===== */}
      <DialogTitle sx={{ fontWeight: 950, fontSize: 22 }}>
        Charging ticket
      </DialogTitle>

      {/* ===== DIALOG CONTENT ===== */}
      <DialogContent dividers sx={{ borderColor: UI.border2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: UI.text3 }}>
            Choose a payment method for a {ticketKwh} kWh ticket.
          </Typography>

          {/* Ticket setup: size and speed */}
          <TicketSetupSection
            ticketKwhInput={ticketKwhInput}
            ticketKwhSuggested={ticketKwhSuggested}
            ticketKwhValid={ticketKwhValid}
            onTicketKwhChange={onTicketKwhChange}
            chargingSpeed={chargingSpeed}
            onChargingSpeedChange={onChargingSpeedChange}
          />

          {/* Pricing summary */}
          <TicketDetailsSection
            ticketKwh={ticketKwh}
            chargingSpeed={chargingSpeed}
            pricePerKwh={pricePerKwh}
            currency={currency}
            ticketPriceLabel={ticketPriceLabel}
          />

          {/* Payment method selection */}
          <PaymentMethodSection
            selectedPaymentId={selectedPaymentId}
            paymentMethods={paymentMethods}
            onPaymentChange={onPaymentChange}
          />

          {/* Error message */}
          {submitError && (
            <Box sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
              {submitError}
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* ===== DIALOG ACTIONS ===== */}
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
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isFormDisabled}
          sx={{
            textTransform: "none",
            borderRadius: 3,
            background: UI.brandGradStrong,
            color: "white",
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
