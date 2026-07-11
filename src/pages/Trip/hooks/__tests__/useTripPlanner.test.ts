import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTripPlanner } from "../useTripPlanner";
import {
  planTrip,
  saveTrip,
  fetchMyTrips,
  deleteTrip,
} from "../../../../api/trips";

vi.mock("../../../../api/trips", () => ({
  planTrip: vi.fn(),
  saveTrip: vi.fn(),
  fetchMyTrips: vi.fn(),
  deleteTrip: vi.fn(),
}));

const input = {
  origin: { lat: 1, lng: 2 },
  destination: { lat: 3, lng: 4 },
};

describe("useTripPlanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMyTrips).mockResolvedValue({ ok: true, trips: [] } as any);
  });

  it("loads saved trips on mount", async () => {
    vi.mocked(fetchMyTrips).mockResolvedValue({
      ok: true,
      trips: [{ id: "t1" }, { id: "t2" }],
    } as any);
    const { result } = renderHook(() => useTripPlanner());
    await waitFor(() => expect(result.current.savedLoading).toBe(false));
    expect(result.current.savedTrips).toHaveLength(2);
  });

  it("runPlan stores the plan on success", async () => {
    vi.mocked(planTrip).mockResolvedValue({
      ok: true,
      plan: { feasible: true, totalStops: 2 },
    } as any);
    const { result } = renderHook(() => useTripPlanner());
    await waitFor(() => expect(result.current.savedLoading).toBe(false));

    await act(async () => {
      await result.current.runPlan(input as any);
    });
    expect(result.current.plan).toEqual({ feasible: true, totalStops: 2 });
    expect(result.current.planError).toBeNull();
  });

  it("runPlan surfaces an error and clears the plan", async () => {
    vi.mocked(planTrip).mockResolvedValue({
      ok: false,
      plan: null,
      error: "nope",
    } as any);
    const { result } = renderHook(() => useTripPlanner());
    await waitFor(() => expect(result.current.savedLoading).toBe(false));

    await act(async () => {
      await result.current.runPlan(input as any);
    });
    expect(result.current.plan).toBeNull();
    expect(result.current.planError).toBe("nope");
  });

  it("save prepends the new trip and flags saved", async () => {
    vi.mocked(saveTrip).mockResolvedValue({
      ok: true,
      trip: { id: "new" },
      plan: { feasible: true },
    } as any);
    const { result } = renderHook(() => useTripPlanner());
    await waitFor(() => expect(result.current.savedLoading).toBe(false));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.save({ ...input, name: "x" } as any);
    });
    expect(ok).toBe(true);
    expect(result.current.saved).toBe(true);
    expect(result.current.savedTrips[0]).toEqual({ id: "new" });
  });

  it("remove deletes and filters the saved list", async () => {
    vi.mocked(fetchMyTrips).mockResolvedValue({
      ok: true,
      trips: [{ id: "t1" }, { id: "t2" }],
    } as any);
    vi.mocked(deleteTrip).mockResolvedValue({ ok: true } as any);
    const { result } = renderHook(() => useTripPlanner());
    await waitFor(() => expect(result.current.savedTrips).toHaveLength(2));

    await act(async () => {
      await result.current.remove("t1");
    });
    expect(result.current.savedTrips.map((t) => t.id)).toEqual(["t2"]);
  });
});
