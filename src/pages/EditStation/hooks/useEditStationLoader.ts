import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchStations } from "../../../api/stations";
import type { Station } from "../../../models/model";

type EditStationLoaderState = {
  station: Station | null;
  loading: boolean;
  error: string | null;
};

// Loads the station record needed for editing.
export default function useEditStationLoader(
  stationId: string | undefined
): EditStationLoaderState {
  const { t } = useTranslation("editStation");
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches station details whenever the station ID changes.
  useEffect(() => {
    if (!stationId) {
      setStation(null);
      setError(t("errors.missingId"));
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    // Fetches the station list and matches the requested station ID.
    const loadStation = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchStations({ signal: controller.signal });
      if (!active) return;
      if (!result.ok) {
        setStation(null);
        setError(result.error || t("errors.loadFailed"));
        setLoading(false);
        return;
      }
      const match =
        result.stations.find((item) => item.id === stationId) ?? null;
      if (!match) {
        setStation(null);
        setError(t("errors.notFound"));
        setLoading(false);
        return;
      }
      setStation(match);
      setLoading(false);
    };

    loadStation();
    return () => {
      active = false;
      controller.abort();
    };
  }, [stationId, t]);

  return { station, loading, error };
}
