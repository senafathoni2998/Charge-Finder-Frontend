import { redirect } from "react-router";
import { updateStation } from "../../api/adminStations";
import {
  parseStationFormData,
  buildStationPayload,
} from "../AddStation/stationFormUtils";
import type { StationRequestResult } from "../AddStation/addStationRoute";
import type { StationFormValues } from "../../forms/schemas";
import type { Station } from "../../models/model";

type StationPayload = Omit<Station, "id"> & { id?: string };

// Handles edit-station submissions for admins.
// NOTE: superseded by updateStationRequest below once StationFormCard adopts
// react-hook-form (the page still uses this action until then).
export async function editStationAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const stationId = String(formData.get("stationId") || "").trim();
  if (!stationId) {
    return { error: "Station ID is missing." };
  }

  const parsed = parseStationFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const result = await updateStation(
    stationId,
    parsed.payload as StationPayload,
  );
  if (!result.ok) {
    return { error: result.error || "Could not update station." };
  }

  return redirect("/admin");
}

/**
 * Updates a station from typed RHF values. Validation is the form's job
 * (zodResolver(stationFormSchema)); navigation is the caller's.
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
