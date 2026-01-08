import { Box, Button, Chip, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { UI } from "../../../theme/theme";
import { formatCurrency } from "../../../utils/distance";
import type { Station, Ticket } from "../types";
import InfoRow from "./InfoRow";
import SectionCard from "./SectionCard";

type PricingSectionProps = {
  loading: boolean;
  station: Station | null;
  ticket: Ticket | null;
  ticketPriceLabel: string;
  ticketKwh: number;
  paymentActionLabel: string;
  onPaymentOpen: () => void;
};

// Presents the pricing breakdown and ticket purchase action.
export default function PricingSection({
  loading,
  station,
  ticket,
  ticketPriceLabel,
  ticketKwh,
  paymentActionLabel,
  onPaymentOpen,
}: PricingSectionProps) {
  return (
    <SectionCard title="Pricing" subtitle="Estimated cost info (may vary by operator)">
      {loading || !station ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={18} />
          <Skeleton variant="rounded" height={18} />
          <Skeleton variant="rounded" height={18} />
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 3,
              border: `1px solid ${UI.border2}`,
              backgroundColor: "rgba(10,10,16,0.02)",
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  Charging ticket
                </Typography>
                {ticket ? (
                  <Chip
                    size="small"
                    label="Ready"
                    sx={{
                      borderRadius: 999,
                      backgroundColor: "rgba(0,229,255,0.12)",
                      border: "1px solid rgba(0,229,255,0.3)",
                      color: UI.text,
                      fontWeight: 800,
                    }}
                  />
                ) : null}
              </Stack>

              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                {ticket ? ticket.priceLabel : ticketPriceLabel}
              </Typography>
              <Typography variant="caption" sx={{ color: UI.text2 }}>
                {ticket
                  ? `Paid with ${ticket.methodLabel}`
                  : `Estimated ${ticketKwh} kWh pack`}
              </Typography>
              <Button
                variant={ticket ? "outlined" : "contained"}
                onClick={onPaymentOpen}
                disabled={!station}
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  borderColor: UI.border,
                  color: ticket ? UI.text : "white",
                  background: ticket ? "transparent" : UI.brandGradStrong,
                }}
              >
                {paymentActionLabel}
              </Button>
            </Stack>
          </Box>
          <Divider sx={{ borderColor: UI.border2 }} />
          <InfoRow
            label="Per kWh"
            value={
              station.pricing.perKwh
                ? formatCurrency(station.pricing.currency, station.pricing.perKwh)
                : "\u2014"
            }
          />
          <InfoRow
            label="Per minute"
            value={
              station.pricing.perMinute
                ? formatCurrency(
                    station.pricing.currency,
                    station.pricing.perMinute
                  )
                : "\u2014"
            }
          />
          <InfoRow label="Parking" value={station.pricing.parkingFee ?? "\u2014"} />
        </Stack>
      )}
    </SectionCard>
  );
}
