import i18n from "../i18n";

type SessionStatus = "valid" | "missing" | "expired";

type SessionCheckResult = {
  status: SessionStatus;
  message: string | null;
};

const AUTH_TOKEN_KEY = "cf_auth_token";
const SESSION_MESSAGE_KEY = "cf_session_message";

const readStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const payload = parts[1];
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    const data = JSON.parse(json);
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

const toExpiryMs = (exp: unknown): number | null => {
  const expNum =
    typeof exp === "number"
      ? exp
      : typeof exp === "string"
      ? Number(exp)
      : Number.NaN;
  if (!Number.isFinite(expNum)) return null;
  return expNum > 1e12 ? expNum : expNum * 1000;
};

export const checkSessionStatus = (
  tokenOverride?: string | null
): SessionCheckResult => {
  const token = tokenOverride ?? readStoredToken();
  if (!token) {
    return {
      status: "missing",
      message: i18n.t("session.missing", { ns: "common" }),
    };
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return { status: "valid", message: null };
  }

  const expiresAt = toExpiryMs(payload.exp);
  if (!expiresAt) {
    return { status: "valid", message: null };
  }

  if (Date.now() >= expiresAt) {
    return {
      status: "expired",
      message: i18n.t("session.expired", { ns: "common" }),
    };
  }

  return { status: "valid", message: null };
};

export const persistSessionMessage = (message: string) => {
  if (!message || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_MESSAGE_KEY, message);
  } catch {
    // ignore
  }
};

export const consumeSessionMessage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const message = window.sessionStorage.getItem(SESSION_MESSAGE_KEY);
    if (message) {
      window.sessionStorage.removeItem(SESSION_MESSAGE_KEY);
    }
    return message;
  } catch {
    return null;
  }
};
