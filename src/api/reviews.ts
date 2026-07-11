import type { ReviewSummary, StationReview } from "../models/model";
import i18n from "../i18n";
import { apiRequest } from "./client";

// Thin API layer over the station-reviews endpoints. Each function returns a
// discriminated result the UI can branch on without touching the HTTP client.

const EMPTY_DISTRIBUTION: Record<string, number> = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
};

const emptySummary = (): ReviewSummary => ({
  average: 0,
  count: 0,
  distribution: { ...EMPTY_DISTRIBUTION },
});

export type ReviewsPagination = {
  limit: number;
  offset: number;
  total: number;
};

type FetchReviewsResult = {
  ok: boolean;
  reviews: StationReview[];
  summary: ReviewSummary;
  pagination: ReviewsPagination;
  error?: string;
};

type MyReviewResult = {
  ok: boolean;
  review: StationReview | null;
  error?: string;
};

type SubmitReviewResult = {
  ok: boolean;
  review: StationReview | null;
  summary: ReviewSummary | null;
  error?: string;
};

type ReviewMutationResult = {
  ok: boolean;
  summary: ReviewSummary | null;
  error?: string;
};

const reviewsPath = (stationId: string) =>
  `/stations/${encodeURIComponent(stationId)}/reviews`;

// Loads a page of a station's reviews plus the aggregate summary (public).
export const fetchStationReviews = async (
  stationId: string,
  {
    limit,
    offset,
    signal,
  }: { limit?: number; offset?: number; signal?: AbortSignal } = {}
): Promise<FetchReviewsResult> => {
  if (!stationId) {
    return {
      ok: false,
      reviews: [],
      summary: emptySummary(),
      pagination: { limit: 0, offset: 0, total: 0 },
      error: i18n.t("reviews.idMissing", { ns: "api" }),
    };
  }

  const query = new URLSearchParams();
  if (Number.isFinite(limit)) query.set("limit", String(limit));
  if (Number.isFinite(offset)) query.set("offset", String(offset));
  const qs = query.toString();
  const path = qs ? `${reviewsPath(stationId)}?${qs}` : reviewsPath(stationId);

  const res = await apiRequest<{
    reviews?: StationReview[];
    summary?: ReviewSummary;
    pagination?: ReviewsPagination;
  }>(path, {
    method: "GET",
    signal,
    fallbackError: i18n.t("reviews.loadFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return {
      ok: false,
      reviews: [],
      summary: emptySummary(),
      pagination: { limit: 0, offset: 0, total: 0 },
      error: res.error,
    };
  }

  return {
    ok: true,
    reviews: Array.isArray(res.data?.reviews) ? res.data.reviews : [],
    summary: res.data?.summary ?? emptySummary(),
    pagination:
      res.data?.pagination ?? { limit: limit ?? 0, offset: offset ?? 0, total: 0 },
  };
};

// Loads the authenticated user's own review for a station (or null).
export const fetchMyStationReview = async (
  stationId: string,
  signal?: AbortSignal
): Promise<MyReviewResult> => {
  if (!stationId) {
    return {
      ok: false,
      review: null,
      error: i18n.t("reviews.idMissing", { ns: "api" }),
    };
  }

  const res = await apiRequest<{ review?: StationReview | null }>(
    `${reviewsPath(stationId)}/me`,
    {
      method: "GET",
      signal,
      fallbackError: i18n.t("reviews.loadFailed", { ns: "api" }),
    }
  );
  if (!res.ok) {
    return { ok: false, review: null, error: res.error };
  }
  return { ok: true, review: res.data?.review ?? null };
};

// Creates or updates the caller's review. The backend enforces eligibility (a
// completed charging session) and returns 403 with a message when ineligible.
export const submitStationReview = async (
  stationId: string,
  { rating, comment }: { rating: number; comment?: string },
  signal?: AbortSignal
): Promise<SubmitReviewResult> => {
  if (!stationId) {
    return {
      ok: false,
      review: null,
      summary: null,
      error: i18n.t("reviews.idMissing", { ns: "api" }),
    };
  }

  const res = await apiRequest<{
    review?: StationReview;
    summary?: ReviewSummary;
  }>(reviewsPath(stationId), {
    method: "POST",
    body: { rating, ...(comment !== undefined ? { comment } : {}) },
    signal,
    fallbackError: i18n.t("reviews.submitFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, review: null, summary: null, error: res.error };
  }
  return {
    ok: true,
    review: res.data?.review ?? null,
    summary: res.data?.summary ?? null,
  };
};

// Deletes the caller's own review for a station.
export const deleteMyStationReview = async (
  stationId: string,
  signal?: AbortSignal
): Promise<ReviewMutationResult> => {
  if (!stationId) {
    return {
      ok: false,
      summary: null,
      error: i18n.t("reviews.idMissing", { ns: "api" }),
    };
  }

  const res = await apiRequest<{ summary?: ReviewSummary }>(
    reviewsPath(stationId),
    {
      method: "DELETE",
      signal,
      fallbackError: i18n.t("reviews.deleteFailed", { ns: "api" }),
    }
  );
  if (!res.ok) {
    return { ok: false, summary: null, error: res.error };
  }
  return { ok: true, summary: res.data?.summary ?? null };
};

// Admin moderation: deletes any review by id.
export const adminDeleteStationReview = async (
  stationId: string,
  reviewId: string,
  signal?: AbortSignal
): Promise<ReviewMutationResult> => {
  if (!stationId || !reviewId) {
    return {
      ok: false,
      summary: null,
      error: i18n.t("reviews.idMissing", { ns: "api" }),
    };
  }

  const res = await apiRequest<{ summary?: ReviewSummary }>(
    `${reviewsPath(stationId)}/${encodeURIComponent(reviewId)}`,
    {
      method: "DELETE",
      signal,
      fallbackError: i18n.t("reviews.deleteFailed", { ns: "api" }),
    }
  );
  if (!res.ok) {
    return { ok: false, summary: null, error: res.error };
  }
  return { ok: true, summary: res.data?.summary ?? null };
};
