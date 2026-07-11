import { useState, type FormEvent } from "react";
import { Box, Button, Rating, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { UI } from "../../../theme/theme";

const COMMENT_MAX = 1000;

type ReviewFormProps = {
  /** Existing values when editing the caller's review (defaults to a blank form). */
  initialRating?: number;
  initialComment?: string;
  isEditing?: boolean;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: { rating: number; comment: string }) => void;
  onDelete?: () => void;
};

// Create/edit form for the caller's own review: a required star rating (1–5) plus
// an optional comment. Eligibility is enforced by the backend, whose message (e.g.
// "review only after a completed session") surfaces via the `error` prop.
export default function ReviewForm({
  initialRating = 0,
  initialComment = "",
  isEditing = false,
  submitting = false,
  error,
  onSubmit,
  onDelete,
}: ReviewFormProps) {
  const { t } = useTranslation("stationDetail");
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>(initialComment);

  const canSubmit = rating >= 1 && rating <= 5 && !submitting;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 1.75,
        borderRadius: 3,
        border: `1px solid ${UI.border2}`,
        backgroundColor: "rgba(124,92,255,0.04)",
      }}
    >
      <Stack spacing={1.25}>
        <Typography sx={{ fontWeight: 800, color: UI.text }}>
          {isEditing ? t("reviews.editTitle") : t("reviews.writeTitle")}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating
            name="review-rating"
            value={rating}
            onChange={(_e, next) => setRating(next ?? 0)}
            size="large"
            sx={{ color: "#F5A623" }}
          />
          <Typography variant="body2" sx={{ color: UI.text3 }}>
            {rating >= 1 ? t("reviews.ratingValue", { rating }) : t("reviews.ratingHint")}
          </Typography>
        </Stack>
        <TextField
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
          placeholder={t("reviews.commentPlaceholder")}
          multiline
          minRows={2}
          fullWidth
          inputProps={{ maxLength: COMMENT_MAX, "aria-label": t("reviews.commentLabel") }}
          helperText={`${comment.length}/${COMMENT_MAX}`}
          FormHelperTextProps={{ sx: { textAlign: "right", m: 0, color: UI.text3 } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: UI.surface,
            },
          }}
        />
        {error ? (
          <Typography sx={{ color: "rgba(244,67,54,0.9)", fontSize: 13 }}>
            {error}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} alignItems="center">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="text"
              disabled={submitting}
              onClick={onDelete}
              sx={{ textTransform: "none", borderRadius: 3, color: UI.text2 }}
            >
              {t("reviews.delete")}
            </Button>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              background: UI.brandGrad,
              boxShadow: "0 12px 30px rgba(124,92,255,0.2)",
            }}
          >
            {submitting
              ? t("reviews.submitting")
              : isEditing
              ? t("reviews.update")
              : t("reviews.submit")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
