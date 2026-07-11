import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useStationReviews } from "../useStationReviews";
import {
  fetchStationReviews,
  fetchMyStationReview,
  submitStationReview,
  deleteMyStationReview,
} from "../../../../api/reviews";

vi.mock("../../../../api/reviews", () => ({
  fetchStationReviews: vi.fn(),
  fetchMyStationReview: vi.fn(),
  submitStationReview: vi.fn(),
  deleteMyStationReview: vi.fn(),
  adminDeleteStationReview: vi.fn(),
}));

const listResult = (overrides = {}) => ({
  ok: true,
  reviews: [{ id: "r1", user: { id: "u2", name: "Bob" }, rating: 4 }],
  summary: { average: 4, count: 1, distribution: {} },
  pagination: { limit: 10, offset: 0, total: 1 },
  ...overrides,
});

describe("useStationReviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchStationReviews).mockResolvedValue(listResult() as any);
    vi.mocked(fetchMyStationReview).mockResolvedValue({
      ok: true,
      review: { id: "r0", user: { id: "u1", name: "Me" }, rating: 5 },
    } as any);
  });

  it("loads reviews, summary and the caller's own review on mount", async () => {
    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: true })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.summary?.count).toBe(1);
    expect(result.current.myReview?.id).toBe("r0");
  });

  it("does not request the caller's review when unauthenticated", async () => {
    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: false })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMyStationReview).not.toHaveBeenCalled();
    expect(result.current.myReview).toBeNull();
  });

  it("submits a review, reloads, and notifies the parent", async () => {
    vi.mocked(submitStationReview).mockResolvedValue({
      ok: true,
      review: { id: "r0", rating: 5 },
      summary: { average: 4.5, count: 2, distribution: {} },
    } as any);
    const onChanged = vi.fn();

    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: true, onChanged })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: { ok: boolean } | undefined;
    await act(async () => {
      res = await result.current.submit({ rating: 5, comment: "Nice" });
    });

    expect(res?.ok).toBe(true);
    expect(submitStationReview).toHaveBeenCalledWith("s1", {
      rating: 5,
      comment: "Nice",
    });
    // Initial load + reload after the mutation.
    expect(vi.mocked(fetchStationReviews).mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(onChanged).toHaveBeenCalled();
  });

  it("returns the error when submitting fails (e.g. ineligible)", async () => {
    vi.mocked(submitStationReview).mockResolvedValue({
      ok: false,
      review: null,
      summary: null,
      error: "Not eligible",
    } as any);

    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: true })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: { ok: boolean; error?: string } | undefined;
    await act(async () => {
      res = await result.current.submit({ rating: 2 });
    });
    expect(res).toEqual({ ok: false, error: "Not eligible" });
  });

  it("discards a stale load after the station changes (no cross-station leak)", async () => {
    let resolveA: (v: unknown) => void = () => {};
    const aPending = new Promise((r) => {
      resolveA = r;
    });
    vi.mocked(fetchStationReviews).mockImplementation((sid: string) => {
      if (sid === "A") return aPending as any;
      return Promise.resolve(
        listResult({ reviews: [{ id: "bReview", user: { id: "ub" }, rating: 3 }] }) as any
      );
    });
    vi.mocked(fetchMyStationReview).mockResolvedValue({ ok: true, review: null } as any);

    const { result, rerender } = renderHook(
      ({ sid }) => useStationReviews(sid, { isAuthenticated: false }),
      { initialProps: { sid: "A" } }
    );
    // Switch to station B while A's fetch is still pending.
    rerender({ sid: "B" });
    await waitFor(() =>
      expect(result.current.reviews[0]?.id).toBe("bReview")
    );

    // A resolves late — its result must be discarded, not applied over B.
    await act(async () => {
      resolveA(listResult({ reviews: [{ id: "aReview", user: { id: "ua" }, rating: 1 }] }));
      await Promise.resolve();
    });
    expect(result.current.reviews[0]?.id).toBe("bReview");
  });

  it("keeps the caller's own review when /reviews/me fails on a reload", async () => {
    vi.mocked(submitStationReview).mockResolvedValue({
      ok: true,
      review: { id: "r0", rating: 4 },
      summary: { average: 4, count: 1, distribution: {} },
    } as any);
    // First /me succeeds (mount); the reload's /me fails.
    vi.mocked(fetchMyStationReview)
      .mockResolvedValueOnce({
        ok: true,
        review: { id: "r0", user: { id: "u1", name: "Me" }, rating: 5 },
      } as any)
      .mockResolvedValue({ ok: false, review: null, error: "boom" } as any);

    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: true })
    );
    await waitFor(() => expect(result.current.myReview?.id).toBe("r0"));

    await act(async () => {
      await result.current.submit({ rating: 4 });
    });
    // The failed /me reload must not drop the known own review.
    expect(result.current.myReview?.id).toBe("r0");
  });

  it("does not flip into the loading skeleton during a mutation reload", async () => {
    let resolveReload: (v: unknown) => void = () => {};
    vi.mocked(fetchStationReviews)
      .mockResolvedValueOnce(listResult() as any)
      .mockImplementationOnce(
        () => new Promise((r) => { resolveReload = r; }) as any
      );
    vi.mocked(submitStationReview).mockResolvedValue({
      ok: true,
      review: { id: "r0", rating: 5 },
      summary: { average: 5, count: 1, distribution: {} },
    } as any);

    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: true })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    let submitPromise: Promise<unknown> | undefined;
    act(() => {
      submitPromise = result.current.submit({ rating: 5 });
    });
    // While the silent reload is in flight, the section must stay rendered.
    await waitFor(() => expect(result.current.submitting).toBe(true));
    expect(result.current.loading).toBe(false);

    await act(async () => {
      resolveReload(listResult());
      await submitPromise;
    });
    expect(result.current.loading).toBe(false);
  });

  it("clears the caller's review after a successful delete", async () => {
    vi.mocked(deleteMyStationReview).mockResolvedValue({
      ok: true,
      summary: { average: 0, count: 0, distribution: {} },
    } as any);
    // After deletion the reload returns no own review.
    vi.mocked(fetchMyStationReview)
      .mockResolvedValueOnce({
        ok: true,
        review: { id: "r0", user: { id: "u1", name: "Me" }, rating: 5 },
      } as any)
      .mockResolvedValue({ ok: true, review: null } as any);

    const { result } = renderHook(() =>
      useStationReviews("s1", { isAuthenticated: true })
    );
    await waitFor(() => expect(result.current.myReview?.id).toBe("r0"));

    await act(async () => {
      await result.current.remove();
    });
    await waitFor(() => expect(result.current.myReview).toBeNull());
  });
});
