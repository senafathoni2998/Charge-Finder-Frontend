import { Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { formatCurrency } from "../../../utils/distance";
import type { Station } from "../types";
import InfoRow from "./InfoRow";
import SectionCard from "./SectionCard";

type PricingSectionProps = {
  loading: boolean;
  station: Station | null;
  paymentActionLabel: string;
  paymentDisabled: boolean;
  onPaymentOpen: () => void;
};

// Presents the pricing breakdown and ticket purchase action.
export default function PricingSection({
  loading,
  station,
  paymentActionLabel,
  paymentDisabled,
  onPaymentOpen,
}: PricingSectionProps) {
  const { t } = useTranslation("stationDetail");
  return (
    <SectionCard title={t("pricing.title")} subtitle={t("pricing.subtitle")}>
      {loading || !station ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={18} />
          <Skeleton variant="rounded" height={18} />
          <Skeleton variant="rounded" height={18} />
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          <Button
            variant="contained"
            onClick={onPaymentOpen}
            disabled={paymentDisabled || !station}
            fullWidth
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: "white",
              background: UI.brandGradStrong,
            }}
          >
            {paymentActionLabel}
          </Button>
          <Divider sx={{ borderColor: UI.border2 }} />
          <InfoRow
            label={t("pricing.perKwh")}
            value={
              station.pricing.perKwh
                ? formatCurrency(station.pricing.currency, station.pricing.perKwh)
                : "\u2014"
            }
          />
          <InfoRow
            label={t("pricing.perMinute")}
            value={
              station.pricing.perMinute
                ? formatCurrency(
                    station.pricing.currency,
                    station.pricing.perMinute
                  )
                : "\u2014"
            }
          />
          <InfoRow label={t("pricing.parking")} value={station.pricing.parkingFee ?? "\u2014"} />
        </Stack>
      )}
    </SectionCard>
  );
}
