import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  planTrip,
  saveTrip,
  fetchMyTrips,
  deleteTrip,
  normalizeStop,
  type PlanInput,
} from "../trips";

describe("trips API", () => {
  const baseUrl = "http://localhost:3000";
  const input: PlanInput = {
    origin: { lat: -6.2, lng: 106.8 },
    destination: { lat: -6.9, lng: 107.6 },
    vehicleId: "veh1",
    startBatteryPercent: 90,
  };

  beforeEach(() => {
    vi.stubEnv("VITE_APP_BACKEND_URL", baseUrl);
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("planTrip", () => {
    it("POSTs origin/destination + only meaningful fields and returns the plan", async () => {
      const plan = { feasible: true, totalStops: 1 };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ plan }),
      });

      const res = await planTrip(input);
      expect(res).toEqual({ ok: true, plan });
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/trips/plan`);
      expect(init.method).toBe("POST");
      const body = JSON.parse(init.body);
      expect(body).toEqual({
        origin: { lat: -6.2, lng: 106.8 },
        destination: { lat: -6.9, lng: 107.6 },
        vehicleId: "veh1",
        startBatteryPercent: 90,
      });
      // Blank optionals must not be sent (so backend/vehicle defaults apply).
      expect(body).not.toHaveProperty("rangeKm");
      expect(body).not.toHaveProperty("bufferPercent");
    });

    it("includes non-empty connectorTypes", async () => {
      (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({ plan: {} }) });
      await planTrip({ ...input, connectorTypes: ["CCS2", "Type2"] });
      const body = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(body.connectorTypes).toEqual(["CCS2", "Type2"]);
    });

    it("surfaces the API error", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ message: "bad" }),
      });
      const res = await planTrip(input);
      expect(res).toEqual({ ok: false, plan: null, error: "bad" });
    });
  });

  describe("saveTrip", () => {
    it("POSTs to /trips with an optional trimmed name and returns trip + plan", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ trip: { id: "t1" }, plan: { feasible: true } }),
      });
      const res = await saveTrip({ ...input, name: "  Weekend  " });
      expect(res.ok).toBe(true);
      expect(res.trip).toEqual({ id: "t1" });
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/trips`);
      expect(JSON.parse(init.body).name).toBe("Weekend");
    });
  });

  describe("fetchMyTrips", () => {
    it("returns the trips array", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ trips: [{ id: "t1" }, { id: "t2" }] }),
      });
      const res = await fetchMyTrips();
      expect(res.ok).toBe(true);
      expect(res.trips).toHaveLength(2);
    });

    it("returns an empty list on error", async () => {
      (global.fetch as any).mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
      const res = await fetchMyTrips();
      expect(res.ok).toBe(false);
      expect(res.trips).toEqual([]);
    });
  });

  describe("deleteTrip", () => {
    it("DELETEs by id", async () => {
      (global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) });
      const res = await deleteTrip("t1");
      expect(res).toEqual({ ok: true });
      const [url, init] = (global.fetch as any).mock.calls[0];
      expect(url).toBe(`${baseUrl}/trips/t1`);
      expect(init.method).toBe("DELETE");
    });

    it("short-circuits without an id", async () => {
      const res = await deleteTrip("");
      expect(res.ok).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("normalizeStop", () => {
    it("reads a fresh plan stop's nested station", () => {
      const normalized = normalizeStop({
        station: { id: "s1", name: "Alpha", address: "Main St", lat: 1, lng: 2 },
        connectorType: "CCS2",
        powerKW: 100,
        distanceFromPrevKm: 40,
        cumulativeKm: 40,
        detourKm: 3,
        arrivalBatteryPercent: 20,
        departBatteryPercent: 80,
      });
      expect(normalized).toMatchObject({
        name: "Alpha",
        address: "Main St",
        lat: 1,
        lng: 2,
        connectorType: "CCS2",
        powerKW: 100,
        arrivalBatteryPercent: 20,
        departBatteryPercent: 80,
      });
    });

    it("reads a saved trip stop's flat fields", () => {
      const normalized = normalizeStop({
        station: "objectid-string",
        name: "Beta",
        lat: 3,
        lng: 4,
        connectorType: "Type2",
        powerKW: 22,
      });
      expect(normalized).toMatchObject({
        name: "Beta",
        lat: 3,
        lng: 4,
        connectorType: "Type2",
        powerKW: 22,
      });
    });
  });
});
