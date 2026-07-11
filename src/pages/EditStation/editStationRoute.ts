import type { TFunction } from "i18next";
import { updateStation } from "../../api/adminStations";
import { buildStationPayload } from "../AddStation/stationFormUtils";
import type { StationRequestResult } from "../AddStation/addStationRoute";
import type { StationImageSelection } from "../AddStation/components/StationFormCard";
import type { StationFormValues } from "../../forms/schemas";
import type { Station } from "../../models/model";

type StationPayload = Omit<Station, "id"> & { id?: string };

/**
 * Updates a station from typed react-hook-form values, applying any feature-image
 * change (new upload or removal). Validation is the form's job
 * (zodResolver(stationFormSchema)); navigation is the caller's.
 */
export async function updateStationRequest(
  stationId: string,
  values: StationFormValues,
  image: StationImageSelection,
  t: TFunction
): Promise<StationRequestResult> {
  if (!stationId) {
    return { ok: false, error: t("errors.missingId") };
  }
  const payload = buildStationPayload(values);
  const result = await updateStation(stationId, payload as StationPayload, {
    image: image.file,
    removeFeaturedImage: image.remove,
  });
  if (!result.ok) {
    return { ok: false, error: result.error || t("errors.updateFailed") };
  }
  return { ok: true };
}
