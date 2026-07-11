import { createStation } from "../../api/adminStations";
import i18n from "../../i18n";
import { buildStationPayload } from "./stationFormUtils";
import type { StationFormValues } from "../../forms/schemas";

export type StationRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Creates a station from typed react-hook-form values, optionally with a feature
 * image. Validation is the form's job (zodResolver(stationFormSchema)); navigation
 * is the caller's.
 */
export async function createStationRequest(
  values: StationFormValues,
  image: File | null = null,
  fallbackError = i18n.t("stations.createFailed", { ns: "api" })
): Promise<StationRequestResult> {
  const payload = buildStationPayload(values);
  const result = await createStation(
    payload as Parameters<typeof createStation>[0],
    { image }
  );
  if (!result.ok) {
    return { ok: false, error: result.error || fallbackError };
  }
  return { ok: true };
}
