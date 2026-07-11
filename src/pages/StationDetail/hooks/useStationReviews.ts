import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReviewSummary, StationReview } from "../../../models/model";
import {
  adminDeleteStationReview,
  deleteMyStationReview,
  fetchMyStationReview,
  fetchStationReviews,
  submitStationReview,
  type ReviewsPagination,
} from "../../../api/reviews";

const PAGE_SIZE = 10;

type MutationResult = { ok: boolean; error?: string };

/**
 * Owns the reviews state for a station: the paginated list, the aggregate summary,
 * and (when signed in) the caller's own review, plus submit/delete/moderation +
 * pagination actions. After any mutation it silently reloads the first page and
 * notifies the parent (onChanged) so the station's denormalized rating can refresh.
 */
export function useStationReviews(
  stationId: string | undefined,
  {
    isAuthenticated,
    onChanged,
  }: { isAuthenticated: boolean; onChanged?: () => void }
) {
  const { t } = useTranslation("stationDetail");
  const [reviews, setReviews] = useState<StationReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [myReview, setMyReview] = useState<StationReview | null>(null);
  const [pagination, setPagination] = useState<ReviewsPagination>({
    limit: PAGE_SIZE,
    offset: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Track the currently-viewed station and mount status so a fetch that resolves
  // after the station changed (same route, no remount) or after unmount is
  // discarded instead of clobbering the newer station's state.
  const stationIdRef = useRef(stationId);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // True only while the results captured for `sid` are still the ones we want.
  const isCurrent = (sid: string | undefined) =>
    mountedRef.current && sid === stationIdRef.current;

  // `silent` reloads (after a mutation) keep the existing content on screen instead
  // of flipping the whole section back to its initial skeleton.
  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      const sid = stationId;
      const silent = opts?.silent ?? false;
      if (!sid) {
        setReviews([]);
        setSummary(null);
        setMyReview(null);
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      setLoadError(null);
      const [list, mine] = await Promise.all([
        fetchStationReviews(sid, { limit: PAGE_SIZE, offset: 0 }),
        isAuthenticated
          ? fetchMyStationReview(sid)
          : Promise.resolve({ ok: true as const, review: null }),
      ]);
      if (!isCurrent(sid)) return;
      if (!list.ok) {
        setLoadError(list.error ?? t("reviews.loadFailed"));
        setSummary(list.summary);
        if (!silent) setLoading(false);
        return;
      }
      setReviews(list.reviews);
      setSummary(list.summary);
      setPagination(list.pagination);
      // Only overwrite the caller's own review when its fetch actually succeeded —
      // otherwise a transient /reviews/me failure would drop it into the public
      // list with no way to edit/delete it.
      if (mine.ok) setMyReview(mine.review);
      if (!silent) setLoading(false);
    },
    [stationId, isAuthenticated, t]
  );

  useEffect(() => {
    stationIdRef.current = stationId;
    load();
  }, [load, stationId]);

  const submit = useCallback(
    async ({
      rating,
      comment,
    }: {
      rating: number;
      comment?: string;
    }): Promise<MutationResult> => {
      if (!stationId) return { ok: false, error: t("reviews.loadFailed") };
      setSubmitting(true);
      const res = await submitStationReview(stationId, { rating, comment });
      if (!res.ok) {
        setSubmitting(false);
        return { ok: false, error: res.error };
      }
      if (res.summary) setSummary(res.summary);
      await load({ silent: true });
      setSubmitting(false);
      onChanged?.();
      return { ok: true };
    },
    [stationId, load, onChanged, t]
  );

  const remove = useCallback(async (): Promise<MutationResult> => {
    if (!stationId) return { ok: false, error: t("reviews.deleteFailed") };
    setSubmitting(true);
    const res = await deleteMyStationReview(stationId);
    if (!res.ok) {
      setSubmitting(false);
      return { ok: false, error: res.error };
    }
    setMyReview(null);
    if (res.summary) setSummary(res.summary);
    await load({ silent: true });
    setSubmitting(false);
    onChanged?.();
    return { ok: true };
  }, [stationId, load, onChanged, t]);

  const moderateRemove = useCallback(
    async (reviewId: string): Promise<MutationResult> => {
      if (!stationId) return { ok: false, error: t("reviews.deleteFailed") };
      const res = await adminDeleteStationReview(stationId, reviewId);
      if (!res.ok) return { ok: false, error: res.error };
      if (res.summary) setSummary(res.summary);
      setMyReview((prev) => (prev?.id === reviewId ? null : prev));
      await load({ silent: true });
      onChanged?.();
      return { ok: true };
    },
    [stationId, load, onChanged, t]
  );

  const loadMore = useCallback(async () => {
    if (!stationId || loadingMore) return;
    const sid = stationId;
    setLoadingMore(true);
    const nextOffset = reviews.length;
    const res = await fetchStationReviews(sid, {
      limit: PAGE_SIZE,
      offset: nextOffset,
    });
    if (!isCurrent(sid)) return;
    setLoadingMore(false);
    if (!res.ok) return;
    setReviews((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      return [...prev, ...res.reviews.filter((r) => !seen.has(r.id))];
    });
    setSummary(res.summary);
    setPagination(res.pagination);
  }, [stationId, reviews.length, loadingMore]);

  const hasMore = reviews.length < (summary?.count ?? 0);

  return {
    reviews,
    summary,
    myReview,
    pagination,
    loading,
    loadError,
    loadingMore,
    submitting,
    hasMore,
    submit,
    remove,
    moderateRemove,
    loadMore,
  };
}
