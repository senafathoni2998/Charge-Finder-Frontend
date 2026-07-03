import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LaunchIcon from "@mui/icons-material/Launch";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { minutesAgo } from "../../../utils/time";
import { statusColor } from "../../../utils/map";
import { statusLabel } from "../../../utils/distance";
import type { Availability } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import type { Station } from "../types";

type ActionsCardProps = {
  loading: boolean;
  station: Station | null;
  isAuthenticated: boolean;
  hasTicket: boolean;
  activeCar: UserCar | null;
  isCompatible: boolean | null;
  canCharge: boolean;
  chargingActionLabel: string;
  onChargingAction: () => void;
  onOpenMaps: () => void;
  chargingError?: string | null;
  chargingLoading?: boolean;
};

// Shows the primary action buttons and live station status.
export default function ActionsCard({
  loading,
  station,
  isAuthenticated,
  hasTicket,
  activeCar,
  isCompatible,
  canCharge,
  chargingActionLabel,
  onChargingAction,
  onOpenMaps,
  chargingError,
  chargingLoading = false,
}: ActionsCardProps) {
  const { t } = useTranslation("stationDetail");
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: UI.border2,
        backgroundColor: UI.surface2,
        backdropFilter: "blur(10px)",
        boxShadow: UI.shadow,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.5}>
          <Typography sx={{ fontWeight: 950, color: UI.text }}>{t("actionsCard.title")}</Typography>
          <Button
            variant="contained"
            disabled={!canCharge || chargingLoading}
            startIcon={<ElectricBoltIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: canCharge ? UI.brandGradStrong : UI.brandGradDisabled,
              color: "white",
              boxShadow: "0 14px 40px rgba(124,92,255,0.14)",
            }}
            onClick={onChargingAction}
          >
            {chargingActionLabel}
          </Button>
          {chargingError ? (
            <Typography variant="caption" sx={{ color: "rgba(244,67,54,0.9)" }}>
              {chargingError}
            </Typography>
          ) : null}
          {!isAuthenticated ? (
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              {t("actionsCard.loginToBuy")}
            </Typography>
          ) : !hasTicket ? (
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              {t("actionsCard.buyToStart")}
            </Typography>
          ) : null}
          {activeCar && isCompatible === false ? (
            <Typography variant="caption" sx={{ color: UI.text3 }}>
              {t("actionsCard.notCompatible")}
            </Typography>
          ) : null}

          <Button
            variant="outlined"
            onClick={onOpenMaps}
            startIcon={<LaunchIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: UI.border,
              color: UI.text,
            }}
          >
            {t("actionsCard.openInMaps")}
          </Button>

          <Divider sx={{ borderColor: UI.border2 }} />

          <Stack spacing={0.75}>
            <Typography variant="caption" sx={{ color: UI.text3, fontWeight: 750 }}>
              {t("actionsCard.chargingStatus")}
            </Typography>
            {loading || !station ? (
              <Skeleton variant="rounded" height={44} />
            ) : (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 3,
                  border: `1px solid ${UI.border2}`,
                  backgroundColor: "rgba(10,10,16,0.02)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                    backgroundColor: statusColor(
                      station.status as Availability,
                      station.isChargingHere
                    ),
                      boxShadow: "0 8px 18px rgba(10,10,16,0.14)",
                      border: "1px solid rgba(255,255,255,0.95)",
                    }}
                  />
                  <Typography sx={{ fontWeight: 900, color: UI.text }}>
                    {statusLabel(station.status as Availability)}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="caption" sx={{ color: UI.text3, fontWeight: 750 }}>
                    {t("actionsCard.minutesAgoShort", {
                      minutes: minutesAgo(station.lastUpdatedISO),
                    })}
                  </Typography>
                </Stack>
              </Box>
            )}

            {!loading && station && station.status !== "AVAILABLE" ? (
              <Typography variant="body2" sx={{ color: UI.text2 }}>
                {station.status === "BUSY"
                  ? t("actionsCard.busyMessage")
                  : t("actionsCard.offlineMessage")}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
