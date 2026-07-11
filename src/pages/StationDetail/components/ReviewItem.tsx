import { Avatar, Box, IconButton, Stack, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import { UI } from "../../../theme/theme";
import { resolveAssetUrl } from "../../../utils/assets";
import { StarRating } from "../../../components";
import type { StationReview } from "../../../models/model";

type ReviewItemProps = {
  review: StationReview;
  /** Show a "You" chip on the caller's own review. */
  isOwn?: boolean;
  /** Show a delete (moderation) button — admins, or the review's owner. */
  canDelete?: boolean;
  onDelete?: (review: StationReview) => void;
};

const formatDate = (value: string): string => {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return "";
  try {
    return new Date(ms).toLocaleDateString(i18n.language || undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return new Date(ms).toDateString();
  }
};

const initialOf = (name: string | null): string =>
  name && name.trim() ? name.trim()[0].toUpperCase() : "?";

// A single station review: reviewer avatar/name, stars, date, comment, and an
// optional delete action (owner or admin moderation).
export default function ReviewItem({
  review,
  isOwn = false,
  canDelete = false,
  onDelete,
}: ReviewItemProps) {
  const { t } = useTranslation("stationDetail");
  const avatarUrl = resolveAssetUrl(review.user.image);
  const name = review.user.name || t("reviews.anonymous");

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${UI.border2}`,
        backgroundColor: "rgba(10,10,16,0.02)",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Avatar
          src={avatarUrl ?? undefined}
          sx={{ width: 36, height: 36, bgcolor: "rgba(124,92,255,0.18)", color: UI.text }}
        >
          {initialOf(review.user.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography sx={{ fontWeight: 800, color: UI.text }}>{name}</Typography>
            {isOwn ? (
              <Box
                sx={{
                  px: 0.75,
                  py: 0.1,
                  borderRadius: 999,
                  border: `1px solid ${UI.border}`,
                  fontSize: 11,
                  fontWeight: 800,
                  color: UI.text2,
                }}
              >
                {t("reviews.you")}
              </Box>
            ) : null}
            <Box sx={{ flex: 1 }} />
            {review.createdAt ? (
              <Typography variant="caption" sx={{ color: UI.text3 }}>
                {formatDate(review.createdAt)}
              </Typography>
            ) : null}
            {canDelete ? (
              <IconButton
                size="small"
                aria-label={t("reviews.delete")}
                onClick={() => onDelete?.(review)}
                sx={{ borderRadius: 2, border: `1px solid ${UI.border2}` }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Stack>
          <Box sx={{ mt: 0.5 }}>
            <StarRating value={review.rating} size="small" />
          </Box>
          {review.comment ? (
            <Typography
              variant="body2"
              sx={{ color: UI.text2, mt: 0.75, whiteSpace: "pre-wrap" }}
            >
              {review.comment}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}
