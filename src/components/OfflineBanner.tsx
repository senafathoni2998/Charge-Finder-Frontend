import { Alert, Snackbar } from "@mui/material";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import { useTranslation } from "react-i18next";

type OfflineBannerProps = {
  /** Current browser connectivity (navigator.onLine). */
  isOnline: boolean;
  /** Whether the stations currently shown came from the last-known cache. */
  usingCachedData: boolean;
  /** When the shown cache snapshot was saved (epoch ms), if any. */
  savedAt?: number | null;
};

// Persistent, non-blocking banner shown while the user is offline and/or the map
// is showing last-known (cached) stations. Anchored below the app bar so it never
// covers the toolbar controls.
export default function OfflineBanner({
  isOnline,
  usingCachedData,
  savedAt,
}: OfflineBannerProps) {
  const { t } = useTranslation("mainPage");

  const shouldShow = !isOnline || usingCachedData;
  if (!shouldShow) return null;

  const minutesAgo =
    typeof savedAt === "number" && Number.isFinite(savedAt)
      ? Math.max(1, Math.round((Date.now() - savedAt) / 60000))
      : null;

  let severity: "warning" | "info" = "info";
  let message: string;
  if (!isOnline) {
    severity = "warning";
    message =
      minutesAgo !== null
        ? t("offline.offlineCached", { minutes: minutesAgo })
        : t("offline.offline");
  } else {
    // Online, but the last fetch failed and we fell back to cached data.
    severity = "info";
    message =
      minutesAgo !== null
        ? t("offline.cached", { minutes: minutesAgo })
        : t("offline.offline");
  }

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: { xs: 72, sm: 76 } }}
    >
      <Alert
        severity={severity}
        variant="filled"
        icon={<CloudOffIcon fontSize="inherit" />}
        sx={{ maxWidth: 520, boxShadow: 3 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
