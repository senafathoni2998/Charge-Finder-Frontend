import store from "../../app/store";
import { login } from "../../features/auth/authSlice";
import { persistLoginSession } from "./loginStorage";

export type LoginRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Performs the login API call and the resulting session side-effects
 * (localStorage + redux). Input is already validated by the form via
 * zodResolver(loginSchema); navigation is the caller's responsibility.
 */
export async function loginRequest({
  email,
  password,
  remember,
}: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<LoginRequestResult> {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: responseData.message || "Failed to log in." };
    }

    const user = responseData.user || {};
    const userEmail =
      typeof user.email === "string" && user.email.trim()
        ? user.email.trim()
        : email;
    const userName =
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : null;
    const userRegion =
      typeof user.region === "string" && user.region.trim()
        ? user.region.trim()
        : null;
    const userRole =
      typeof user.role === "string" && user.role.trim()
        ? user.role.trim()
        : null;
    const userId =
      typeof user.id === "string"
        ? user.id
        : user.id != null
        ? String(user.id)
        : "";

    persistLoginSession({
      token: user.token,
      userId,
      email: userEmail,
      region: userRegion,
      role: userRole,
      remember,
    });

    store.dispatch(
      login({
        email: userEmail,
        name: userName,
        region: userRegion,
        role: userRole,
        userId: userId,
      })
    );

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to log in.",
    };
  }
}
