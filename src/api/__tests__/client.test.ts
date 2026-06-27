import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiRequest } from "../client";

describe("apiRequest", () => {
  const baseUrl = "http://localhost:3000";

  beforeEach(() => {
    vi.stubEnv("VITE_APP_BACKEND_URL", baseUrl);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns a config error and does not fetch when no base URL is set", async () => {
    vi.stubEnv("VITE_APP_BACKEND_URL", "");
    const res = await apiRequest("/stations");
    expect(res).toEqual({
      ok: false,
      status: 0,
      error: "Backend URL is not configured.",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("resolves the base URL and returns parsed data on success", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ a: 1 }),
    });
    const res = await apiRequest<{ a: number }>("/stations", { method: "GET" });
    expect(res).toEqual({ ok: true, status: 200, data: { a: 1 } });
    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/stations`,
      expect.objectContaining({ method: "GET", credentials: "include" })
    );
  });

  it("JSON-encodes the body and sets the content-type header", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await apiRequest("/x", { method: "POST", body: { a: 1 } });
    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/x`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 1 }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("uses the response message on HTTP error", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: "Bad input" }),
    });
    const res = await apiRequest("/x", { fallbackError: "fallback" });
    expect(res).toEqual({ ok: false, status: 422, error: "Bad input" });
  });

  it("falls back to fallbackError when the error response has no message", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const res = await apiRequest("/x", { fallbackError: "Could not load." });
    expect(res).toEqual({ ok: false, status: 500, error: "Could not load." });
  });

  it("does not require a base URL or send credentials for absolute requests", async () => {
    vi.stubEnv("VITE_APP_BACKEND_URL", "");
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: 1 }),
    });
    const res = await apiRequest("https://example.com/x", { absolute: true });
    expect(res.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://example.com/x",
      expect.not.objectContaining({ credentials: "include" })
    );
  });

  it("normalizes network errors with the thrown message", async () => {
    (global.fetch as any).mockRejectedValue(new Error("boom"));
    const res = await apiRequest("/x", { fallbackError: "fallback" });
    expect(res).toEqual({ ok: false, status: 0, error: "boom" });
  });

  it("reports a timeout as an aborted result", async () => {
    vi.useFakeTimers();
    (global.fetch as any).mockImplementation(
      (_url: string, opts: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError"))
          );
        })
    );
    const promise = apiRequest("/x", { timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const res = await promise;
    expect(res).toEqual({
      ok: false,
      status: 0,
      aborted: true,
      error: "Request timed out.",
    });
    vi.useRealTimers();
  });
});
