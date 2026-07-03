import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchStationById } from "../../../api/stations";
import type { Station } from "../types";

/**
 * Loads a single station by id (F3) with abort handling, plus a refreshStation
 * callback used after charging actions to re-pull connector availability.
 */
export function useStationData(stationId: string | undefined) {
  const { t } = useTranslation("stationDetail");
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<Station | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setStation(null);
      setLoading(false);
      setLoadError(t("stationData.missingId"));
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadStation = async () => {
      setLoading(true);
      setLoadError(null);
      // Fetch only this station (not the entire stations collection) — see F3.
      const result = await fetchStationById(stationId, controller.signal);
      if (!active) return;
      if (!result.ok) {
        setStation(null);
        setLoadError(result.error || t("stationData.loadFailed"));
        setLoading(false);
        return;
      }
      if (!result.station) {
        setLoadError(t("stationData.notFound"));
      }
      setStation(result.station);
      setLoading(false);
    };

    loadStation();
    return () => {
      active = false;
      controller.abort();
    };
  }, [stationId, t]);

  const refreshStation = useCallback(async () => {
    if (!stationId) return;
    const result = await fetchStationById(stationId);
    if (result.ok && result.station) {
      setStation(result.station);
    }
  }, [stationId]);

  return { loading, station, loadError, refreshStation };
}
