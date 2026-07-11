import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchStationReviews,
  fetchMyStationReview,
  submitStationReview,
  deleteMyStationReview,
  adminDeleteStationReview,
} from "../reviews";

describe("reviews API", () => {
  const baseUrl = "http://localhost:3000";
  const stationId = "st1";

  const okJson = (data: unknown) => ({ ok: true, status: 200, json: async () => data });

  beforeEach(() => {
    vi.stubEnv("VITE_APP_BACKEND_URL", baseUrl);
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("fetchStationReviews", () => {
    it("returns reviews, summary and pagination on success", async () => {
      const payload = {
        reviews: [{ id: "r1", rating: 5 }],
        summary: { average: 4.5, count: 2, distribution: { "5": 1, "4": 1 } },
        pagination: { limit: 10, offset: 0, total: 2 },
      };
      (global.fetch as any).mockResolvedValue(okJson(payload));

      const res = await fetchStationReviews(stationId, { limit: 10, offset: 0 });

      expect(res.ok).toBe(true);
      expect(res.reviews).toHaveLength(1);
      expect(res.summary.average).toBe(4.5);
      expect(res.pagination.total).toBe(2);
      const [url] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/st1/reviews?limit=10&offset=0`);
    });

    it("returns an error and empty summary on HTTP failure", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "boom" }),
      });
      const res = await fetchStationReviews(stationId);
      expect(res.ok).toBe(false);
      expect(res.error).toBe("boom");
      expect(res.summary).toEqual({
        average: 0,
        count: 0,
        distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      });
    });

    it("short-circuits without fetching when stationId is missing", async () => {
      const res = await fetchStationReviews("");
      expect(res.ok).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("fetchMyStationReview", () => {
    it("returns the review when present", async () => {
      (global.fetch as any).mockResolvedValue(okJson({ review: { id: "r1", rating: 4 } }));
      const res = await fetchMyStationReview(stationId);
      expect(res).toEqual({ ok: true, review: { id: "r1", rating: 4 } });
      const [url] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/st1/reviews/me`);
    });

    it("returns null when the user has no review", async () => {
      (global.fetch as any).mockResolvedValue(okJson({ review: null }));
      const res = await fetchMyStationReview(stationId);
      expect(res).toEqual({ ok: true, review: null });
    });
  });

  describe("submitStationReview", () => {
    it("POSTs rating + comment and returns review + summary", async () => {
      (global.fetch as any).mockResolvedValue(
        okJson({ review: { id: "r1", rating: 5 }, summary: { average: 5, count: 1, distribution: {} } })
      );
      const res = await submitStationReview(stationId, { rating: 5, comment: "Great" });
      expect(res.ok).toBe(true);
      expect(res.review).toEqual({ id: "r1", rating: 5 });
      expect(res.summary?.average).toBe(5);
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/st1/reviews`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual({ rating: 5, comment: "Great" });
    });

    it("omits comment from the body when not provided", async () => {
      (global.fetch as any).mockResolvedValue(okJson({ review: { id: "r1", rating: 3 } }));
      await submitStationReview(stationId, { rating: 3 });
      const [, init] = (global.fetch as any).mock.calls[0];
      expect(JSON.parse(init.body)).toEqual({ rating: 3 });
    });

    it("surfaces the backend eligibility message on 403", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          message:
            "You can only review a station after completing a charging session there.",
        }),
      });
      const res = await submitStationReview(stationId, { rating: 4 });
      expect(res.ok).toBe(false);
      expect(res.error).toMatch(/completing a charging session/);
    });
  });

  describe("deleteMyStationReview", () => {
    it("DELETEs and returns the updated summary", async () => {
      (global.fetch as any).mockResolvedValue(
        okJson({ summary: { average: 0, count: 0, distribution: {} } })
      );
      const res = await deleteMyStationReview(stationId);
      expect(res.ok).toBe(true);
      expect(res.summary?.count).toBe(0);
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/st1/reviews`);
      expect(init.method).toBe("DELETE");
    });
  });

  describe("adminDeleteStationReview", () => {
    it("DELETEs a review by id", async () => {
      (global.fetch as any).mockResolvedValue(okJson({ summary: { average: 3, count: 1, distribution: {} } }));
      const res = await adminDeleteStationReview(stationId, "r9");
      expect(res.ok).toBe(true);
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/stations/st1/reviews/r9`);
      expect(init.method).toBe("DELETE");
    });

    it("short-circuits when reviewId is missing", async () => {
      const res = await adminDeleteStationReview(stationId, "");
      expect(res.ok).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
