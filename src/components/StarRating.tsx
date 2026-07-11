import { Rating, Stack, Typography } from "@mui/material";
import { UI } from "../theme/theme";

type StarRatingProps = {
  /** Average rating (0–5). Nullish renders as 0 (empty stars). */
  value: number | null | undefined;
  /** When set, shows a "(count)" suffix — omit to hide it. */
  count?: number | null;
  /** When true, shows the numeric average before the count. */
  showValue?: boolean;
  size?: "small" | "medium" | "large";
};

// Read-only star display shared by the station overview, list card, review items,
// and the reviews summary. Wraps MUI's Rating with half-star precision so the
// denormalized average (rounded to one decimal) renders faithfully.
export default function StarRating({
  value,
  count,
  showValue = false,
  size = "small",
}: StarRatingProps) {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Rating
        value={safeValue}
        precision={0.5}
        readOnly
        size={size}
        sx={{ color: "#F5A623" }}
      />
      {showValue ? (
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color: UI.text, ml: 0.25 }}
        >
          {safeValue.toFixed(1)}
        </Typography>
      ) : null}
      {typeof count === "number" ? (
        <Typography variant="body2" sx={{ color: UI.text3 }}>
          ({count})
        </Typography>
      ) : null}
    </Stack>
  );
}
