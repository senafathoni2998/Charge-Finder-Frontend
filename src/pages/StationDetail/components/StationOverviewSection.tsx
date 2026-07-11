import { useState } from "react";
import { Box, Button, Chip, Skeleton, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import LaunchIcon from "@mui/icons-material/Launch";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { UI } from "../../../theme/theme";
import { minutesAgo } from "../../../utils/time";
import { resolveAssetUrl } from "../../../utils/assets";
import type { Availability } from "../../../models/model";
import type { UserCar } from "../../../features/auth/authSlice";
import type { Station } from "../types";
import StatusChip from "../../MainPage/components/StatusChip";
import MiniPhoto from "./MiniPhoto";
import SectionCard from "./SectionCard";

type StationOverviewSectionProps = {
  loading: boolean;
  station: Station | null;
  activeCar: UserCar | null;
  isCompatible: boolean | null;
  distanceKm: number | null;
  onReportIssue: () => void;
};

// Renders the station overview section with photos and quick status.
export default function StationOverviewSection({
  loading,
  station,
  activeCar,
  isCompatible,
  distanceKm,
  onReportIssue,
}: StationOverviewSectionProps) {
  const { t } = useTranslation("stationDetail");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const title = loading
    ? t("overview.loading")
    : (station?.name ?? t("overview.stationFallback"));
  const subtitle = loading ? "" : station?.address;

  const photos = station?.photos ?? [];
  const photoCount = photos.length || 3;
  const featuredImageUrl = resolveAssetUrl(station?.featuredImage);

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photoCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photoCount - 1 ? 0 : prev + 1));
  };

  return (
    <SectionCard
      title={title}
      subtitle={subtitle}
      right={
        loading ? (
          <Skeleton variant="rounded" width={90} height={28} />
        ) : station ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip
              status={station.status as Availability}
              isChargingHere={station.isChargingHere}
            />
            {activeCar && activeCar.connectorTypes.length ? (
              <Chip
                size="small"
                label={isCompatible ? t("overview.compatible") : t("overview.notSupported")}
                sx={{
                  borderRadius: 999,
                  backgroundColor: isCompatible
                    ? "rgba(0,229,255,0.16)"
                    : "rgba(244,67,54,0.16)",
                  border: `1px solid ${
                    isCompatible
                      ? "rgba(0,229,255,0.35)"
                      : "rgba(244,67,54,0.35)"
                  }`,
                  color: UI.text,
                  fontWeight: 800,
                }}
              />
            ) : null}
          </Stack>
        ) : null
      }
    >
      {loading || !station ? (
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={140} />
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          {featuredImageUrl ? (
            <Box
              component="img"
              src={featuredImageUrl}
              alt={t("overview.featuredAlt", { name: station.name })}
              sx={{
                width: "100%",
                height: { xs: 180, sm: 240 },
                objectFit: "cover",
                borderRadius: 4,
                border: `1px solid ${UI.border2}`,
              }}
            />
          ) : null}
          {isMobile ? (
            <Box sx={{ position: "relative" }}>
              <MiniPhoto
                key={currentPhotoIndex}
                label={photos[currentPhotoIndex]?.label ?? t("overview.photoFallback")}
                gradient={photos[currentPhotoIndex]?.gradient ?? UI.brandGrad}
              />
              {/* Navigation dots */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {Array.from({ length: photoCount }).map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    sx={{
                      width: currentPhotoIndex === index ? 24 : 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: currentPhotoIndex === index
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      transition: "width 200ms ease, background-color 200ms ease",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <MiniPhoto
                label={photos[0]?.label ?? t("overview.photoFallback")}
                gradient={photos[0]?.gradient ?? UI.brandGrad}
              />
              <MiniPhoto
                label={photos[1]?.label ?? t("overview.photoFallback")}
                gradient={photos[1]?.gradient ?? UI.brandGrad}
              />
              <MiniPhoto
                label={photos[2]?.label ?? t("overview.photoFallback")}
                gradient={photos[2]?.gradient ?? UI.brandGrad}
              />
            </Stack>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
          >
            <Chip
              icon={<LaunchIcon />}
              label={
                distanceKm
                  ? t("overview.kmAway", { distance: distanceKm.toFixed(1) })
                  : "\u2014"
              }
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
                alignSelf: { xs: "flex-start", sm: "auto" },
              }}
            />
            <Chip
              label={t("overview.updatedAgo", {
                minutes: minutesAgo(station.lastUpdatedISO),
              })}
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(10,10,16,0.04)",
                border: `1px solid ${UI.border2}`,
                color: UI.text2,
                fontWeight: 750,
                alignSelf: { xs: "flex-start", sm: "auto" },
              }}
            />
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              onClick={onReportIssue}
              startIcon={<ReportProblemIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 3,
                borderColor: UI.border,
                color: UI.text,
                alignSelf: { xs: "stretch", sm: "auto" },
              }}
            >
              {t("overview.reportIssue")}
            </Button>
          </Stack>

          {station.notes ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: `1px dashed ${UI.border}`,
                backgroundColor: "rgba(10,10,16,0.02)",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: UI.text }}>
                {t("overview.notes")}
              </Typography>
              <Typography variant="body2" sx={{ color: UI.text2, mt: 0.5 }}>
                {station.notes}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      )}
    </SectionCard>
  );
}
