import type { Station } from "../models/model";
import { apiRequest } from "./client";

type StationPayload = Omit<Station, "id"> & { id?: string };

type StationMutationResult = {
  ok: boolean;
  station: Station | null;
  error?: string;
};

type StationDeleteResult = {
  ok: boolean;
  error?: string;
};

type StationResponse = { station?: Station; data?: Station };

// Creates a new station using admin credentials.
export const createStation = async (
  payload: StationPayload,
  signal?: AbortSignal
): Promise<StationMutationResult> => {
  const res = await apiRequest<StationResponse>("/stations/add-station", {
    method: "POST",
    body: payload,
    signal,
    fallbackError: "Could not create station.",
  });
  if (!res.ok) {
    return { ok: false, station: null, error: res.error };
  }
  const station = (res.data?.station ?? res.data?.data ?? null) as Station | null;
  return { ok: true, station };
};

// Updates a station using admin credentials.
export const updateStation = async (
  stationId: string,
  payload: StationPayload,
  signal?: AbortSignal
): Promise<StationMutationResult> => {
  if (!stationId) {
    return { ok: false, station: null, error: "Station ID is missing." };
  }

  const res = await apiRequest<StationResponse>("/stations/update-station", {
    method: "PATCH",
    body: { ...payload, stationId },
    signal,
    fallbackError: "Could not update station.",
  });
  if (!res.ok) {
    return { ok: false, station: null, error: res.error };
  }
  const station = (res.data?.station ?? res.data?.data ?? null) as Station | null;
  return { ok: true, station };
};

// Deletes a station using admin credentials.
export const deleteStation = async (
  stationId: string,
  signal?: AbortSignal
): Promise<StationDeleteResult> => {
  if (!stationId) {
    return { ok: false, error: "Station ID is missing." };
  }

  const res = await apiRequest("/stations/delete-station", {
    method: "DELETE",
    body: { stationId },
    signal,
    fallbackError: "Could not delete station.",
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true };
};
