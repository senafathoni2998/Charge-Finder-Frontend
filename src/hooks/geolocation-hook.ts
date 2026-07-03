import { useCallback, useState } from "react";

import i18n from "../i18n";

export function useGeoLocation() {
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(i18n.t("geolocation.unsupported", { ns: "common" }));
      setLoading(false);
      setRequestId((prev) => prev + 1);
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        setRequestId((prev) => prev + 1);
      },
      (err) => {
        setError(err.message || i18n.t("geolocation.failed", { ns: "common" }));
        setLoading(false);
        setRequestId((prev) => prev + 1);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  return { loc, loading, error, request, requestId };
}
