import { redirect } from "react-router";
import store from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { persistSessionMessage } from "../../utils/session";
import type { ProfileLoaderData } from "./types";
import {
  clearAuthStorage,
  readStoredActiveCarId,
  readStoredAuthToken,
} from "./profileStorage";

type ProfileFetchResult = {
  ok: boolean;
  status: number;
  data: unknown | null;
};

// Fetches JSON safely for loader routes, returning status details on errors.
const fetchProfileJson = async (
  url: string,
  signal?: AbortSignal
): Promise<ProfileFetchResult> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      signal,
    });
    const status = response.status;
    if (!response.ok) return { ok: false, status, data: null };
    try {
      return { ok: true, status, data: await response.json() };
    } catch {
      return { ok: false, status, data: null };
    }
  } catch {
    return { ok: false, status: 0, data: null };
  }
};

// Loads the profile and vehicle data for the profile route.
export async function profileLoader({ request }: { request: Request }) {
  if (typeof window === "undefined") {
    return { user: null, vehicles: null, activeCarId: null };
  }

  const activeCarId = readStoredActiveCarId();
  const token = readStoredAuthToken();
  if (!token) {
    return { user: null, vehicles: null, activeCarId };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { user: null, vehicles: null, activeCarId };
  }

  const [profileResult, vehiclesResult] = await Promise.all([
    fetchProfileJson(`${baseUrl}/profile`, request.signal),
    fetchProfileJson(`${baseUrl}/vehicles`, request.signal),
  ]);

  const unauthorized = [profileResult.status, vehiclesResult.status].some(
    (status) => status === 401 || status === 403
  );
  if (unauthorized) {
    persistSessionMessage("Your session has expired. Please log in again.");
    clearAuthStorage({ setLogoutRedirect: false });
    store.dispatch(logout());
    return { user: null, vehicles: null, activeCarId };
  }

  const profileData = profileResult.ok ? profileResult.data : null;
  const vehiclesData = vehiclesResult.ok ? vehiclesResult.data : null;

  const user =
    profileData && typeof profileData === "object"
      ? (profileData as { user?: ProfileLoaderData["user"] }).user ?? null
      : null;
  const vehiclesPayload =
    vehiclesData && typeof vehiclesData === "object"
      ? (vehiclesData as { vehicles?: unknown[] }).vehicles
      : null;
  const vehicles = Array.isArray(vehiclesPayload) ? vehiclesPayload : null;

  return { user, vehicles, activeCarId };
}

// Handles logout submissions. Profile edits and password changes are now
// client-side react-hook-form forms (see profileRequests.ts).
export async function profileAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "logout") {
    try {
      const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
      if (baseUrl) {
        await fetch(`${baseUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      }
    } catch {
      // ignore
    }

    clearAuthStorage();
    store.dispatch(logout());
    return redirect("/");
  }

  return { error: "Unknown action." };
}
