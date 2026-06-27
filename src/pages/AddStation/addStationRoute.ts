import { redirect } from "react-router";
import { createStation } from "../../api/adminStations";
import { parseStationFormData, buildStationPayload } from "./stationFormUtils";
import type { StationFormValues } from "../../forms/schemas";

export type StationRequestResult = { ok: true } | { ok: false; error: string };

// Handles add-station submissions for admins.
// NOTE: superseded by createStationRequest below once StationFormCard adopts
// react-hook-form (the page still uses this action until then).
export async function addStationAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const parsed = parseStationFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const result = await createStation(
    parsed.payload as Parameters<typeof createStation>[0],
  );
  if (!result.ok) {
    return { error: result.error || "Could not create station." };
  }

  return redirect("/admin");
}

/**
 * Creates a station from typed RHF values. Validation is the form's job
 * (zodResolver(stationFormSchema)); navigation is the caller's.
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
