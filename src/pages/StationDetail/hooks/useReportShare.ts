import { useState } from "react";
import { buildMapsUrl, getSharePayload } from "../utils";
import { REPORT_ISSUE_TYPES } from "../constants";
import type { Station } from "../types";

/** Report-issue + share/open-in-maps UI state and handlers for a station. */
export function useReportShare(station: Station | null) {
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportType, setReportType] = useState(REPORT_ISSUE_TYPES[0]);
  const [reportNote, setReportNote] = useState("");

  const openGoogleMaps = () => {
    if (!station || typeof window === "undefined") return;
    window.open(
      buildMapsUrl(station.lat, station.lng),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const share = async () => {
    if (!station) return;
    const payload = getSharePayload(station);

    try {
      // Prefer native share.
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(payload);
        return;
      }
      setShareOpen(true);
    } catch {
      setShareOpen(true);
    }
  };

  const submitReport = () => {
    // Canvas-safe demo: just close and reset.
    setReportOpen(false);
    setReportNote("");
  };

  return {
    reportOpen,
    setReportOpen,
    shareOpen,
    setShareOpen,
    reportType,
    setReportType,
    reportNote,
    setReportNote,
    openGoogleMaps,
    share,
    submitReport,
  };
}
