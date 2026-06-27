import { createStation } from "../../api/adminStations";
import { buildStationPayload } from "./stationFormUtils";
import type { StationFormValues } from "../../forms/schemas";

export type StationRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Creates a station from typed react-hook-form values. Validation is the form's
 * job (zodResolver(stationFormSchema)); navigation is the caller's.
 */
export async function createStationRequest(
  values: StationFormValues
): Promise<StationRequestResult> {
  const payload = buildStationPayload(values);
  const result = await createStation(
    payload as Parameters<typeof createStation>[0]
  );
  if (!result.ok) {
    return { ok: false, error: result.error || "Could not create station." };
  }
  return { ok: true };
}
