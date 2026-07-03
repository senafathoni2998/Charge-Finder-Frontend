import type { Station } from "../models/model";
import i18n from "../i18n";
import { apiRequest } from "./client";

type FetchStationsResult = {
  ok: boolean;
  stations: Station[];
  error?: string;
};

type FetchStationsParams = {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  signal?: AbortSignal;
};

type FetchStationResult = {
  ok: boolean;
  station: Station | null;
  error?: string;
};

// Loads stations from the backend, returning an empty list on failures.
export const fetchStations = async (
  params: FetchStationsParams = {}
): Promise<FetchStationsResult> => {
  const { lat, lng, radiusKm, signal } = params;
  const query = new URLSearchParams();
  const hasLat = Number.isFinite(lat);
  const hasLng = Number.isFinite(lng);
  if (hasLat && hasLng) {
    query.set("lat", String(lat));
    query.set("lng", String(lng));
    if (Number.isFinite(radiusKm)) {
      query.set("radiusKm", String(radiusKm));
    }
  }
  const queryString = query.toString();
  const path = queryString ? `/stations?${queryString}` : `/stations`;

  const res = await apiRequest<{ stations?: Station[] }>(path, {
    method: "GET",
    signal,
    fallbackError: i18n.t("stations.loadFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, stations: [], error: res.error };
  }
  const stations = Array.isArray(res.data?.stations) ? res.data.stations : [];
  return { ok: true, stations };
};

// Loads a single station by id.
export const fetchStationById = async (
  stationId: string,
  signal?: AbortSignal
): Promise<FetchStationResult> => {
  if (!stationId) {
    return {
      ok: false,
      station: null,
      error: i18n.t("stations.idMissing", { ns: "api" }),
    };
  }

  const res = await apiRequest<{ station?: Station } | null>(
    `/stations/${encodeURIComponent(stationId)}`,
    {
      method: "GET",
      signal,
      fallbackError: i18n.t("stations.loadOneFailed", { ns: "api" }),
    }
  );
  if (!res.ok) {
    return { ok: false, station: null, error: res.error };
  }

  const data = res.data;
  const station =
    data && typeof data === "object"
      ? (data as { station?: Station }).station ?? data
      : null;
  if (!station || typeof station !== "object") {
    return {
      ok: false,
      station: null,
      error: i18n.t("stations.notFound", { ns: "api" }),
    };
  }

  return { ok: true, station: station as Station };
};
