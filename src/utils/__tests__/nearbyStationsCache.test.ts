import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Station } from "../../models/model";
import {
  saveNearbyStations,
  loadNearbyStations,
  clearNearbyStations,
  clearOfflineStationCaches,
} from "../nearbyStationsCache";

const st = (id: string): Station =>
  ({ id, name: `Station ${id}`, lat: 1, lng: 2 }) as unknown as Station;

const center = { lat: -6.2, lng: 106.8 };

describe("nearbyStationsCache", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("round-trips a saved snapshot", () => {
    saveNearbyStations(center, 20, [st("a"), st("b")]);
    const snap = loadNearbyStations();
    expect(snap).not.toBeNull();
    expect(snap!.stations.map((s) => s.id)).toEqual(["a", "b"]);
    expect(snap!.center).toEqual(center);
    expect(snap!.radiusKm).toBe(20);
    expect(typeof snap!.savedAt).toBe("number");
  });

  it("returns null when nothing is stored", () => {
    expect(loadNearbyStations()).toBeNull();
  });

  it("never clobbers a good snapshot with an empty list", () => {
    saveNearbyStations(center, 20, [st("a")]);
    saveNearbyStations(center, 20, []);
    expect(loadNearbyStations()!.stations.map((s) => s.id)).toEqual(["a"]);
  });

  it("ignores a save with a non-finite center", () => {
    saveNearbyStations({ lat: Number.NaN, lng: 10 }, 20, [st("a")]);
    expect(loadNearbyStations()).toBeNull();
  });

  it("caps stored stations at 300", () => {
    const many = Array.from({ length: 400 }, (_, i) => st(`s${i}`));
    saveNearbyStations(center, 20, many);
    expect(loadNearbyStations()!.stations).toHaveLength(300);
  });

  it("returns null for corrupt JSON", () => {
    window.localStorage.setItem("cf_nearby_stations_v1", "{not json");
    expect(loadNearbyStations()).toBeNull();
  });

  it("returns null for a structurally invalid snapshot", () => {
    window.localStorage.setItem(
      "cf_nearby_stations_v1",
      JSON.stringify({ stations: [st("a")], savedAt: 1 }), // no center
    );
    expect(loadNearbyStations()).toBeNull();
  });

  it("treats snapshots older than maxAge as absent", () => {
    const now = 1_000_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    saveNearbyStations(center, 20, [st("a")]);

    // 25h later, default 24h window → expired.
    vi.spyOn(Date, "now").mockReturnValue(now + 25 * 60 * 60 * 1000);
    expect(loadNearbyStations()).toBeNull();
    // maxAge 0 disables the age check.
    expect(loadNearbyStations(0)).not.toBeNull();
  });

  it("swallows quota errors on save", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => saveNearbyStations(center, 20, [st("a")])).not.toThrow();
  });

  it("swallows read errors on load", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadNearbyStations()).toBeNull();
  });

  it("clears the snapshot", () => {
    saveNearbyStations(center, 20, [st("a")]);
    clearNearbyStations();
    expect(loadNearbyStations()).toBeNull();
  });

  it("strips the per-user isChargingHere flag before persisting", () => {
    const charging = {
      id: "c",
      name: "Charging",
      lat: 1,
      lng: 2,
      isChargingHere: true,
    } as unknown as Station;
    saveNearbyStations(center, 20, [charging]);
    const snap = loadNearbyStations();
    expect(snap!.stations[0]).not.toHaveProperty("isChargingHere");
    expect(snap!.stations[0].id).toBe("c");
  });

  describe("clearOfflineStationCaches", () => {
    afterEach(() => {
      delete (globalThis as { caches?: unknown }).caches;
    });

    it("no-ops (resolves) when CacheStorage is unavailable", async () => {
      await expect(clearOfflineStationCaches()).resolves.toBeUndefined();
    });

    it("deletes only the cf-stations-* caches", async () => {
      const del = vi.fn().mockResolvedValue(true);
      (globalThis as { caches?: unknown }).caches = {
        keys: vi
          .fn()
          .mockResolvedValue(["cf-stations-v1", "cf-shell-v1", "cf-tiles-v1"]),
        delete: del,
      };
      await clearOfflineStationCaches();
      expect(del).toHaveBeenCalledWith("cf-stations-v1");
      expect(del).not.toHaveBeenCalledWith("cf-shell-v1");
      expect(del).not.toHaveBeenCalledWith("cf-tiles-v1");
    });
  });
});
