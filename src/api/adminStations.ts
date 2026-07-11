import type { Station } from "../models/model";
import i18n from "../i18n";
import { apiRequest } from "./client";
import {
  buildStationFormData,
  type StationFormPayload,
} from "../pages/AddStation/stationFormUtils";
import { isAllowedImageType, MAX_IMAGE_UPLOAD_BYTES } from "../utils/assets";

type StationPayload = Omit<Station, "id"> & { id?: string };

// Feature-image upload options shared by create/update. When `image` is set (or
// `removeFeaturedImage` on update), the request is sent as multipart FormData;
// otherwise the classic JSON path is used.
type StationImageOptions = {
  image?: File | null;
  removeFeaturedImage?: boolean;
  signal?: AbortSignal;
};

type StationMutationResult = {
  ok: boolean;
  station: Station | null;
  error?: string;
};

// Validates a to-be-uploaded feature image against the same MIME/size rules the
// backend enforces, so the user gets an instant, localized error. Returns an error
// message, or null when the file is acceptable.
const validateFeatureImage = (image: File): string | null => {
  if (!isAllowedImageType(image)) {
    return i18n.t("stations.imageInvalidType", { ns: "api" });
  }
  if (image.size > MAX_IMAGE_UPLOAD_BYTES) {
    return i18n.t("stations.imageTooLarge", { ns: "api" });
  }
  return null;
};

type StationDeleteResult = {
  ok: boolean;
  error?: string;
};

type StationResponse = { station?: Station; data?: Station };

// Creates a new station using admin credentials. When `options.image` is provided
// the request is multipart (feature image + JSON-encoded fields); otherwise JSON.
export const createStation = async (
  payload: StationPayload,
  options: StationImageOptions = {}
): Promise<StationMutationResult> => {
  const { image, signal } = options;
  const fallbackError = i18n.t("stations.createFailed", { ns: "api" });

  let body: unknown = payload;
  if (image) {
    const imageError = validateFeatureImage(image);
    if (imageError) {
      return { ok: false, station: null, error: imageError };
    }
    const form = buildStationFormData(payload as unknown as StationFormPayload);
    form.append("featuredImage", image);
    body = form;
  }

  const res = await apiRequest<StationResponse>("/stations/add-station", {
    method: "POST",
    body,
    signal,
    fallbackError,
  });
  if (!res.ok) {
    return { ok: false, station: null, error: res.error };
  }
  const station = (res.data?.station ?? res.data?.data ?? null) as Station | null;
  return { ok: true, station };
};

// Updates a station using admin credentials. A new `options.image` replaces the
// feature image; `options.removeFeaturedImage` clears it. Either triggers a
// multipart request; without them the classic JSON path is used.
export const updateStation = async (
  stationId: string,
  payload: StationPayload,
  options: StationImageOptions = {}
): Promise<StationMutationResult> => {
  if (!stationId) {
    return {
      ok: false,
      station: null,
      error: i18n.t("stations.idMissing", { ns: "api" }),
    };
  }

  const { image, removeFeaturedImage, signal } = options;
  const fallbackError = i18n.t("stations.updateFailed", { ns: "api" });

  let body: unknown = { ...payload, stationId };
  if (image || removeFeaturedImage) {
    if (image) {
      const imageError = validateFeatureImage(image);
      if (imageError) {
        return { ok: false, station: null, error: imageError };
      }
    }
    const form = buildStationFormData(payload as unknown as StationFormPayload);
    form.append("stationId", stationId);
    if (image) {
      form.append("featuredImage", image);
    }
    if (removeFeaturedImage) {
      form.append("removeFeaturedImage", "true");
    }
    body = form;
  }

  const res = await apiRequest<StationResponse>("/stations/update-station", {
    method: "PATCH",
    body,
    signal,
    fallbackError,
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
    return { ok: false, error: i18n.t("stations.idMissing", { ns: "api" }) };
  }

  const res = await apiRequest("/stations/delete-station", {
    method: "DELETE",
    body: { stationId },
    signal,
    fallbackError: i18n.t("stations.deleteFailed", { ns: "api" }),
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true };
};
