import { updateStation } from "../../api/adminStations";
import { buildStationPayload } from "../AddStation/stationFormUtils";
import type { StationRequestResult } from "../AddStation/addStationRoute";
import type { StationFormValues } from "../../forms/schemas";
import type { Station } from "../../models/model";

type StationPayload = Omit<Station, "id"> & { id?: string };

/**
 * Updates a station from typed react-hook-form values. Validation is the form's
 * job (zodResolver(stationFormSchema)); navigation is the caller's.
 */
export async function updateStationRequest(
  stationId: string,
  values: StationFormValues
): Promise<StationRequestResult> {
  if (!stationId) {
    return { ok: false, error: "Station ID is missing." };
  }
  const payload = buildStationPayload(values);
  const result = await updateStation(stationId, payload as StationPayload);
  if (!result.ok) {
    return { ok: false, error: result.error || "Could not update station." };
  }
  return { ok: true };
}
