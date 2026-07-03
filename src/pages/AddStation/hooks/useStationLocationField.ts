import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { reverseGeocode } from "../../../api/geocode";
import { useGeoLocation } from "../../../hooks/geolocation-hook";
import type { StationFormValues } from "../../../forms/schemas";
import { getMapCenter } from "../stationFormUtils";

type LocationPoint = { lat: number; lng: number };

type StationLocationField = {
  locationCenter: LocationPoint;
  selectedPoint: LocationPoint | null;
  onMapPick: (lat: number, lng: number) => void;
  onRequestLocation: () => void;
  locationLoading: boolean;
  addressLookupLoading: boolean;
  locationError: string | null;
};

/**
 * Encapsulates the station form's map / geolocation / reverse-geocode behaviour,
 * writing lat/lng/address back into the react-hook-form via setValue. Shared by
 * AddStation and EditStation (it used to be duplicated across both).
 */
export default function useStationLocationField(
  setValue: UseFormSetValue<StationFormValues>,
  lat: string,
  lng: string
): StationLocationField {
  const { t } = useTranslation("addStation");
  const geo = useGeoLocation();
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(
    null
  );
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const addressLookupAbort = useRef<AbortController | null>(null);
  const addressLookupId = useRef(0);

  const setCoords = useCallback(
    (latStr: string, lngStr: string) => {
      setValue("lat", latStr, { shouldValidate: true, shouldDirty: true });
      setValue("lng", lngStr, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  // Resolves the address for the selected map coordinates (abort/race guarded).
  const handlePickLocation = useCallback(
    async (latValue: number, lngValue: number) => {
      addressLookupAbort.current?.abort();
      const controller = new AbortController();
      addressLookupAbort.current = controller;
      const lookupId = (addressLookupId.current += 1);
      setAddressLookupLoading(true);
      setAddressLookupError(null);

      const result = await reverseGeocode(
        latValue,
        lngValue,
        controller.signal
      );
      if (controller.signal.aborted || lookupId !== addressLookupId.current) {
        return;
      }
      setAddressLookupLoading(false);
      if (result.ok && result.address) {
        setValue("address", result.address, {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }
      setAddressLookupError(result.error || t("errors.resolveAddress"));
    },
    [setValue, t]
  );

  const onMapPick = useCallback(
    (latValue: number, lngValue: number) => {
      setCoords(latValue.toFixed(6), lngValue.toFixed(6));
      handlePickLocation(latValue, lngValue);
    },
    [setCoords, handlePickLocation]
  );

  const onRequestLocation = useCallback(() => {
    setUseMyLocation(true);
    geo.request();
  }, [geo.request]);

  // Syncs lat/lng when the user requests their current location.
  useEffect(() => {
    if (!useMyLocation || !geo.loc) return;
    const loc = geo.loc;
    setCoords(loc.lat.toFixed(6), loc.lng.toFixed(6));
    handlePickLocation(loc.lat, loc.lng);
    setUseMyLocation(false);
  }, [geo.loc, useMyLocation, setCoords, handlePickLocation]);

  // Cancels any in-flight address lookups when the form unmounts.
  useEffect(() => {
    return () => {
      addressLookupAbort.current?.abort();
    };
  }, []);

  const locationCenter = useMemo(
    () => getMapCenter(lat, lng, geo.loc ?? undefined),
    [geo.loc, lat, lng]
  );

  const latNum = lat.trim() ? Number(lat) : Number.NaN;
  const lngNum = lng.trim() ? Number(lng) : Number.NaN;
  const selectedPoint =
    Number.isFinite(latNum) && Number.isFinite(lngNum)
      ? { lat: latNum, lng: lngNum }
      : null;

  return {
    locationCenter,
    selectedPoint,
    onMapPick,
    onRequestLocation,
    locationLoading: geo.loading,
    addressLookupLoading,
    locationError: addressLookupError || geo.error || null,
  };
}
