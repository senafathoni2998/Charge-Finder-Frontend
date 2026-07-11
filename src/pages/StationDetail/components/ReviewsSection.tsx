import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";
import { StarRating } from "../../../components";
import type { StationReview } from "../../../models/model";
import SectionCard from "./SectionCard";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";
import { useStationReviews } from "../hooks/useStationReviews";

type ReviewsSectionProps = {
  stationId: string | undefined;
  isAuthenticated: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
  /** Called after a successful mutation so the parent can refresh the station. */
  onReviewsChanged?: () => void;
};

const STARS = [5, 4, 3, 2, 1] as const;

// The station reviews & ratings section: aggregate summary with a star breakdown,
// the caller's own review editor (gated server-side), and the paginated list of
// everyone else's reviews with admin moderation.
export default function ReviewsSection({
  stationId,
  isAuthenticated,
  currentUserId,
  isAdmin,
  onReviewsChanged,
}: ReviewsSectionProps) {
  const { t } = useTranslation("stationDetail");
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    reviews,
    summary,
    myReview,
    loading,
    loadError,
    loadingMore,
    submitting,
    hasMore,
    submit,
    remove,
    moderateRemove,
    loadMore,
  } = useStationReviews(stationId, {
    isAuthenticated,
    onChanged: onReviewsChanged,
  });

  const total = summary?.count ?? 0;
  const average = summary?.average ?? 0;
  // The caller's own review is managed in the editor above; keep it out of the list.
  const otherReviews = reviews.filter((r) => !(myReview && r.id === myReview.id));

  const handleSubmit = async (values: { rating: number; comment: string }) => {
    setFormError(null);
    const res = await submit(values);
    if (!res.ok) setFormError(res.error ?? t("reviews.submitFailed"));
  };

  const handleDeleteOwn = async () => {
    setFormError(null);
    const res = await remove();
    if (!res.ok) setFormError(res.error ?? t("reviews.deleteFailed"));
  };

  const handleModerate = async (review: StationReview) => {
    setActionError(null);
    const res = await moderateRemove(review.id);
    if (!res.ok) setActionError(res.error ?? t("reviews.deleteFailed"));
  };

  const handleLoginRedirect = () => {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    navigate(`/login?next=${next}`);
  };

  return (
    <SectionCard
      title={t("reviews.title")}
      subtitle={t("reviews.subtitle")}
      right={
        !loading && total > 0 ? (
          <StarRating value={average} showValue size="small" />
        ) : undefined
      }
    >
      {loading ? (
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={70} />
        </Stack>
      ) : (
        <Stack spacing={1.75}>
          {/* Aggregate summary + star distribution */}
          {total > 0 ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ sm: "center" }}
            >
              <Stack alignItems="center" sx={{ minWidth: 96 }}>
                <Typography sx={{ fontWeight: 950, fontSize: 40, color: UI.text, lineHeight: 1 }}>
                  {average.toFixed(1)}
                </Typography>
                <StarRating value={average} size="small" />
                <Typography variant="caption" sx={{ color: UI.text3, mt: 0.5 }}>
                  {t("reviews.summaryCount", { count: total })}
                </Typography>
              </Stack>
              <Stack spacing={0.5} sx={{ flex: 1, width: "100%" }}>
                {STARS.map((star) => {
                  const count = summary?.distribution?.[String(star)] ?? 0;
                  const percent = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <Stack key={star} direction="row" spacing={1} alignItems="center">
                      <Stack
                        direction="row"
                        spacing={0.25}
                        alignItems="center"
                        sx={{ width: 28 }}
                      >
                        <Typography variant="caption" sx={{ color: UI.text2, fontWeight: 700 }}>
                          {star}
                        </Typography>
                        <StarRoundedIcon sx={{ fontSize: 14, color: "#F5A623" }} />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: "rgba(10,10,16,0.06)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            backgroundColor: "#F5A623",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: UI.text3, width: 24, textAlign: "right" }}
                      >
                        {count}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: UI.text2 }}>
              {t("reviews.noReviewsYet")}
            </Typography>
          )}

          {loadError ? (
            <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
              {loadError}
            </Typography>
          ) : null}

          <Divider sx={{ borderColor: UI.border2 }} />

          {/* The caller's own review editor, or a login prompt. */}
          {!isAuthenticated ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Typography variant="body2" sx={{ color: UI.text2, flex: 1 }}>
                {t("reviews.loginPrompt")}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleLoginRedirect}
                sx={{ textTransform: "none", borderRadius: 3, borderColor: UI.border, color: UI.text }}
              >
                {t("reviews.login")}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={0.75}>
              <ReviewForm
                key={myReview?.id ?? "new"}
                isEditing={!!myReview}
                initialRating={myReview?.rating ?? 0}
                initialComment={myReview?.comment ?? ""}
                submitting={submitting}
                error={formError}
                onSubmit={handleSubmit}
                onDelete={myReview ? handleDeleteOwn : undefined}
              />
              {!myReview ? (
                <Typography variant="caption" sx={{ color: UI.text3 }}>
                  {t("reviews.eligibilityHint")}
                </Typography>
              ) : null}
            </Stack>
          )}

          {/* Everyone else's reviews. */}
          {otherReviews.length > 0 ? (
            <>
              <Divider sx={{ borderColor: UI.border2 }} />
              {actionError ? (
                <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
                  {actionError}
                </Typography>
              ) : null}
              <Stack spacing={1.25}>
                {otherReviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    isOwn={
                      !!currentUserId && review.user.id === currentUserId
                    }
                    canDelete={isAdmin}
                    onDelete={handleModerate}
                  />
                ))}
              </Stack>
              {hasMore ? (
                <Button
                  variant="text"
                  onClick={loadMore}
                  disabled={loadingMore}
                  sx={{ textTransform: "none", borderRadius: 3, color: UI.text2, alignSelf: "center" }}
                >
                  {loadingMore ? t("reviews.loading") : t("reviews.loadMore")}
                </Button>
              ) : null}
            </>
          ) : null}
        </Stack>
      )}
    </SectionCard>
  );
}
