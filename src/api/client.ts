// Single typed HTTP client for the api/* layer. Centralizes base-URL resolution,
// JSON headers + credentials, safe response parsing, error normalization, a request
// timeout, and abort handling — so individual api functions only build a request and
// shape the response.

import i18n from "../i18n";

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; aborted?: boolean };

export type ApiRequestOptions = {
  method?: string;
  /** Serialized to JSON (with a Content-Type header) when provided. */
  body?: unknown;
  /** Caller's AbortSignal (e.g. from a component effect cleanup). */
  signal?: AbortSignal;
  /** Per-request timeout. Set to 0 to disable. Defaults to 15s. */
  timeoutMs?: number;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  /** When true, `path` is treated as a full URL; no base URL or credentials are applied. */
  absolute?: boolean;
  /** Error message used when neither the response nor the thrown error has its own. */
  fallbackError?: string;
};

const DEFAULT_TIMEOUT_MS = 15000;

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const {
    method = "GET",
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    credentials = "include",
    absolute = false,
    fallbackError = i18n.t("client.requestFailed", { ns: "api" }),
  } = options;

  let url = path;
  if (!absolute) {
    const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
    if (!baseUrl) {
      return {
        ok: false,
        status: 0,
        error: i18n.t("client.backendNotConfigured", { ns: "api" }),
      };
    }
    url = `${baseUrl}${path}`;
  }

  // Combine the caller's signal with an internal timeout into one abort signal so
  // every request has a bounded deadline and still honors caller-initiated cancels.
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abortFromCaller, { once: true });
  }
  let timedOut = false;
  const timeoutId =
    timeoutMs > 0
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, timeoutMs)
      : null;

  const hasBody = body !== undefined && body !== null;

  try {
    const response = await fetch(url, {
      method,
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(absolute ? {} : { credentials }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data && typeof data === "object" &&
        typeof (data as { message?: unknown }).message === "string"
          ? (data as { message: string }).message
          : fallbackError;
      return { ok: false, status: response.status, error: message };
    }

    return { ok: true, status: response.status, data: data as T };
  } catch (err) {
    if (timedOut) {
      return {
        ok: false,
        status: 0,
        aborted: true,
        error: i18n.t("client.timedOut", { ns: "api" }),
      };
    }
    if (controller.signal.aborted) {
      return {
        ok: false,
        status: 0,
        aborted: true,
        error: i18n.t("client.cancelled", { ns: "api" }),
      };
    }
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : fallbackError,
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", abortFromCaller);
  }
}
