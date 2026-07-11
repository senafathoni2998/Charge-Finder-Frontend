import { useEffect, useState } from "react";
import { fetchStationAvailability } from "../../../api/stations";
import type { Availability, Connector } from "../../../models/model";

// How often to re-poll live connector availability while the tab is visible.
const AVAILABILITY_POLL_MS = 8000;

export type StationAvailabilityState = {
  /** Live connectors (with fresh availablePorts), or null before the first poll. */
  connectors: Connector[] | null;
  status: Availability | null;
  lastUpdatedISO: string | null;
  /** Client timestamp (ms) of the last successful poll. */
  updatedAt: number | null;
  /** True once at least one poll has succeeded for the current station. */
  live: boolean;
};

/**
 * Polls a station's live connector availability from the uncached endpoint.
 *
 * Polling (not the user-scoped charging WebSocket) is used because availability is
 * public station-wide data that changes when ANY driver occupies/frees a port. The
 * poll pauses while the tab is hidden and fires immediately again on refocus, and
 * keeps the last-known values on a transient error rather than blanking the UI.
 */
export function useStationAvailability(
  stationId: string | undefined
): StationAvailabilityState {
  const [connectors, setConnectors] = useState<Connector[] | null>(null);
  const [status, setStatus] = useState<Availability | null>(null);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [live, setLive] = useState(false);

  // Reset SYNCHRONOUSLY when the station changes (React's "adjust state on prop
  // change" pattern — runs during render, before commit). This prevents a
  // one-frame flash of the previous station's connectors under a "Live" pill when
  // navigating A -> B without a remount; a post-commit effect reset would be too late.
  const [trackedStationId, setTrackedStationId] = useState(stationId);
  if (stationId !== trackedStationId) {
    setTrackedStationId(stationId);
    setConnectors(null);
    setStatus(null);
    setLastUpdatedISO(null);
    setUpdatedAt(null);
    setLive(false);
  }

  useEffect(() => {
    if (!stationId) return;

    let cancelled = false;
    let inFlight = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let controller: AbortController | null = null;

    const poll = async () => {
      // Skip (don't stack, and don't abort) while a request is still in flight, so
      // a response slower than the poll interval isn't starved by the next tick.
      if (inFlight) return;
      inFlight = true;
      controller = new AbortController();
      try {
        const res = await fetchStationAvailability(stationId, controller.signal);
        if (cancelled || !res.ok || !res.availability) return;
        setConnectors(res.availability.connectors);
        setStatus(res.availability.status);
        setLastUpdatedISO(res.availability.lastUpdatedISO);
        setUpdatedAt(Date.now());
        setLive(true);
      } finally {
        inFlight = false;
      }
    };

    const start = () => {
      if (timer) return;
      void poll();
      timer = setInterval(() => void poll(), AVAILABILITY_POLL_MS);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.hidden) stop();
      else start();
    };

    const startsHidden = typeof document !== "undefined" && document.hidden;
    if (!startsHidden) start();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      cancelled = true;
      stop();
      controller?.abort();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [stationId]);

  return { connectors, status, lastUpdatedISO, updatedAt, live };
}
