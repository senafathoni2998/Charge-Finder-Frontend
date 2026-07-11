import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useStationAvailability } from "../useStationAvailability";
import { fetchStationAvailability } from "../../../../api/stations";

vi.mock("../../../../api/stations", () => ({
  fetchStationAvailability: vi.fn(),
}));

const okAvail = (availablePorts: number) => ({
  ok: true as const,
  availability: {
    stationId: "s1",
    status: "AVAILABLE" as const,
    lastUpdatedISO: "2026-01-01T00:00:00.000Z",
    connectors: [
      { type: "CCS2" as const, powerKW: 50, ports: 4, availablePorts },
    ],
  },
});

describe("useStationAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls immediately and exposes live availability", async () => {
    vi.mocked(fetchStationAvailability).mockResolvedValue(okAvail(2) as any);
    const { result } = renderHook(() => useStationAvailability("s1"));

    await waitFor(() => expect(result.current.live).toBe(true));
    expect(result.current.connectors?.[0].availablePorts).toBe(2);
    expect(result.current.status).toBe("AVAILABLE");
    expect(fetchStationAvailability).toHaveBeenCalledWith(
      "s1",
      expect.any(AbortSignal)
    );
  });

  it("does not fetch when stationId is undefined", () => {
    const { result } = renderHook(() => useStationAvailability(undefined));
    expect(fetchStationAvailability).not.toHaveBeenCalled();
    expect(result.current.live).toBe(false);
    expect(result.current.connectors).toBeNull();
  });

  it("re-polls on the interval while visible", async () => {
    vi.useFakeTimers();
    vi.mocked(fetchStationAvailability).mockResolvedValue(okAvail(2) as any);

    renderHook(() => useStationAvailability("s1"));
    // The effect fires an immediate poll on mount.
    expect(fetchStationAvailability).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8000);
    });
    expect(fetchStationAvailability).toHaveBeenCalledTimes(2);
  });

  it("resets synchronously on station change (no stale cross-station flash)", async () => {
    vi.mocked(fetchStationAvailability)
      .mockResolvedValueOnce(okAvail(2) as any) // station A's poll
      .mockImplementation(() => new Promise(() => {}) as any); // B's poll stays pending

    const { result, rerender } = renderHook(
      ({ sid }) => useStationAvailability(sid),
      { initialProps: { sid: "A" } }
    );
    await waitFor(() => expect(result.current.live).toBe(true));

    // Switching stations must clear the previous station's live data in the SAME
    // render, before B's first poll resolves — so B never paints A's numbers.
    rerender({ sid: "B" });
    expect(result.current.connectors).toBeNull();
    expect(result.current.live).toBe(false);
  });

  it("does not abort a slow in-flight poll when the interval fires", async () => {
    vi.useFakeTimers();
    let resolvePoll: (v: unknown) => void = () => {};
    vi.mocked(fetchStationAvailability).mockImplementationOnce(
      () => new Promise((r) => { resolvePoll = r; }) as any
    );

    const { result } = renderHook(() => useStationAvailability("s1"));
    expect(fetchStationAvailability).toHaveBeenCalledTimes(1);

    // Interval fires while the first request is still pending — it must be skipped,
    // not started-and-abort the slow one (which would starve slow networks).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8000);
    });
    expect(fetchStationAvailability).toHaveBeenCalledTimes(1);

    // The slow request finally resolves and its data lands.
    await act(async () => {
      resolvePoll(okAvail(4));
      await Promise.resolve();
    });
    expect(result.current.connectors?.[0].availablePorts).toBe(4);
    expect(result.current.live).toBe(true);
  });

  it("keeps the last-known values when a later poll fails", async () => {
    vi.useFakeTimers();
    vi.mocked(fetchStationAvailability)
      .mockResolvedValueOnce(okAvail(3) as any)
      .mockResolvedValue({ ok: false, availability: null, error: "x" } as any);

    const { result } = renderHook(() => useStationAvailability("s1"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.connectors?.[0].availablePorts).toBe(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8000);
    });
    // The failed poll is ignored — the previous live value is retained.
    expect(result.current.connectors?.[0].availablePorts).toBe(3);
    expect(result.current.live).toBe(true);
  });
});
