import i18n from "../i18n";
import { apiRequest } from "./client";

type FetchChargingHistoryResult = {
  ok: boolean;
  history: Record<string, unknown>[];
  error?: string;
};

// Loads charging history items for the last 3 days.
export const fetchChargingHistory = async (
  signal?: AbortSignal
): Promise<FetchChargingHistoryResult> => {
  const res = await apiRequest<{ history?: Record<string, unknown>[] }>(
    "/profile/charging-history",
    {
      method: "GET",
      signal,
      fallbackError: i18n.t("history.loadFailed", { ns: "api" }),
    }
  );
  if (!res.ok) {
    return { ok: false, history: [], error: res.error };
  }
  const history = Array.isArray(res.data?.history) ? res.data.history : [];
  return { ok: true, history };
};
