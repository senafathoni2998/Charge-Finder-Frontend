import { useCallback, useEffect, useState } from "react";
import { fetchStationById } from "../../../api/stations";
import type { Station } from "../types";

/**
 * Loads a single station by id (F3) with abort handling, plus a refreshStation
 * callback used after charging actions to re-pull connector availability.
 */
export function useStationData(stationId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<Station | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) {
      setStation(null);
      setLoading(false);
      setLoadError("Station ID is missing.");
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
        setLoadError(result.error || "Could not load station data.");
        setLoading(false);
        return;
      }
      if (!result.station) {
        setLoadError("Station not found.");
      }
      setStation(result.station);
      setLoading(false);
    };

    loadStation();
    return () => {
      active = false;
      controller.abort();
    };
  }, [stationId]);

  const refreshStation = useCallback(async () => {
    if (!stationId) return;
    const result = await fetchStationById(stationId);
    if (result.ok && result.station) {
      setStation(result.station);
    }
  }, [stationId]);

  return { loading, station, loadError, refreshStation };
}
