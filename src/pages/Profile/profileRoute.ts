import { redirect } from "react-router";
import store from "../../app/store";
import { logout } from "../../features/auth/authSlice";
import { passwordIssue } from "../../utils/validate";
import type { ProfileLoaderData } from "./types";
import {
  clearAuthStorage,
  readStoredActiveCarId,
  readStoredAuthToken,
  readStoredUserId,
} from "./profileStorage";

// Fetches JSON safely for loader routes, returning null on errors.
const fetchProfileJson = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    signal,
  });
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
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

  const [profileData, vehiclesData] = await Promise.all([
    fetchProfileJson(`${baseUrl}/profile`, request.signal).catch(() => null),
    fetchProfileJson(`${baseUrl}/vehicles`, request.signal).catch(() => null),
  ]);

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

// Handles profile edits, password changes, and logout submissions.
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

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return {
      intent: intent === "password" ? "password" : "profile",
      error: "Backend URL is not configured.",
    };
  }

  const rawUserId = String(formData.get("userId") || "").trim();
  const userId = rawUserId || readStoredUserId() || "";

  if (intent === "profile") {
    const name = String(formData.get("name") || "").trim();
    const region = String(formData.get("region") || "").trim();
    if (!name) {
      return { intent: "profile", error: "Name is required." };
    }
    if (!userId) {
      return { intent: "profile", error: "User session is missing." };
    }

    try {
      const response = await fetch(`${baseUrl}/profile/update-profile`, {
        method: "PATCH",
        body: JSON.stringify({
          userId,
          name,
          region,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          intent: "profile",
          error: responseData.message || "Could not update profile.",
        };
      }
      return {
        intent: "profile",
        ok: true,
        name,
        region: region || null,
      };
    } catch (err) {
      return {
        intent: "profile",
        error: err instanceof Error ? err.message : "Could not update profile.",
      };
    }
  }

  if (intent === "password") {
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (!currentPassword.trim()) {
      return { intent: "password", error: "Enter your current password." };
    }
    const issue = passwordIssue(newPassword);
    if (issue) {
      return { intent: "password", error: issue };
    }
    if (!newPassword.trim()) {
      return { intent: "password", error: "Enter a new password." };
    }
    if (newPassword !== confirmPassword) {
      return { intent: "password", error: "Passwords do not match." };
    }
    if (currentPassword === newPassword) {
      return {
        intent: "password",
        error: "New password must be different.",
      };
    }
    if (!userId) {
      return { intent: "password", error: "User session is missing." };
    }

    try {
      const response = await fetch(`${baseUrl}/profile/update-password`, {
        method: "PATCH",
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          intent: "password",
          error: responseData.message || "Failed to update password.",
        };
      }
      return { intent: "password", ok: true };
    } catch (err) {
      return {
        intent: "password",
        error:
          err instanceof Error ? err.message : "Failed to update password.",
      };
    }
  }

  return { intent: "profile", error: "Unknown action." };
}
