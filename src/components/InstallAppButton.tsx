import { IconButton, Tooltip } from "@mui/material";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import { useTranslation } from "react-i18next";

import { UI } from "../theme/theme";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

type InstallAppButtonProps = {
  color?: string;
};

// Toolbar affordance that appears only when the browser signals the app is
// installable (Chromium's beforeinstallprompt). Hidden otherwise — including on
// iOS and once already installed — so it never shows a dead button.
export default function InstallAppButton({
  color = UI.text,
}: InstallAppButtonProps) {
  const { t } = useTranslation("nav");
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <Tooltip title={t("tooltips.install")}>
      <IconButton
        onClick={() => {
          promptInstall().catch(() => {});
        }}
        sx={{
          borderRadius: 3,
          color,
          ":hover": {
            border: `1px solid ${UI.border2}`,
            backgroundColor: "rgba(10,10,16,0.03)",
          },
        }}
        aria-label={t("aria.install")}
      >
        <InstallMobileIcon />
      </IconButton>
    </Tooltip>
  );
}
