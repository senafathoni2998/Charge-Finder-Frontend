import { apiRequest } from "./client";

type ReverseGeocodeResult = {
  ok: boolean;
  address: string | null;
  error?: string;
};

// Resolves an address for a latitude/longitude using OpenStreetMap Nominatim.
export const reverseGeocode = async (
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult> => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, address: null, error: "Invalid coordinates." };
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const res = await apiRequest<{ display_name?: string }>(url.toString(), {
    method: "GET",
    absolute: true,
    headers: { Accept: "application/json" },
    signal,
    fallbackError: "Could not resolve address.",
  });
  if (!res.ok) {
    return { ok: false, address: null, error: res.error };
  }

  const address =
    typeof res.data?.display_name === "string"
      ? res.data.display_name.trim()
      : "";
  if (!address) {
    return { ok: false, address: null, error: "No address found." };
  }
  return { ok: true, address };
};
