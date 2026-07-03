import { Chip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import type { Availability } from "../../../models/model";

type StatusChipProps = {
  status: Availability;
  isChargingHere?: boolean;
};

type StatusKey = Availability | "CHARGING";

export default function StatusChip({ status, isChargingHere }: StatusChipProps) {
  const { t } = useTranslation("mainPage");
  const map: Record<StatusKey, { label: string; sx: SxProps<Theme> }> = {
    CHARGING: {
      label: t("status.charging"),
      sx: {
        borderColor: "rgba(0, 200, 83, 0.55)",
        backgroundColor: "rgba(0, 200, 83, 0.14)",
      },
    },
    AVAILABLE: {
      label: t("common:status.available"),
      sx: {
        borderColor: "rgba(0, 229, 255, 0.55)",
        backgroundColor: "rgba(0, 229, 255, 0.14)",
      },
    },
    BUSY: {
      label: t("common:status.busy"),
      sx: {
        borderColor: "rgba(255, 193, 7, 0.55)",
        backgroundColor: "rgba(255, 193, 7, 0.14)",
      },
    },
    OFFLINE: {
      label: t("common:status.offline"),
      sx: {
        borderColor: "rgba(244, 67, 54, 0.55)",
        backgroundColor: "rgba(244, 67, 54, 0.14)",
      },
    },
  };

  const key: StatusKey = isChargingHere ? "CHARGING" : status;
  const config = map[key] ?? map.OFFLINE;

  return (
    <Chip
      size="small"
      variant="outlined"
      label={config.label}
      sx={{
        borderRadius: 999,
        color: UI.text,
        fontWeight: 700,
        ...config.sx,
      }}
    />
  );
}
