import store from "../../app/store";
import { login } from "../../features/auth/authSlice";
import { persistSignupSession } from "./signupStorage";

export type SignupRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Performs the signup API call and the resulting session side-effects. Field
 * validation (email/password/confirm) is handled by the form via
 * zodResolver(signupFormSchema); navigation is the caller's responsibility.
 */
export async function signupRequest({
  name,
  region,
  email,
  password,
  remember,
  image,
}: {
  name: string;
  region: string;
  email: string;
  password: string;
  remember: boolean;
  image: File | null;
}): Promise<SignupRequestResult> {
  if (image && !image.type.startsWith("image/")) {
    return { ok: false, error: "Profile photo must be an image file." };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  try {
    let response: Response;
    if (image) {
      const payload = new FormData();
      payload.append("email", email);
      payload.append("password", password);
      payload.append("name", name);
      if (region) payload.append("region", region);
      payload.append("image", image);
      response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        body: payload,
        credentials: "include",
      });
    } else {
      response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
          region,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    }
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: responseData.message || "Failed to sign up." };
    }

    const user = responseData.user || {};
    const userEmail =
      typeof user.email === "string" && user.email.trim()
        ? user.email.trim()
        : email;
    const userName =
      typeof user.name === "string" && user.name.trim()
        ? user.name.trim()
        : name || null;
    const userRegion =
      typeof user.region === "string" && user.region.trim()
        ? user.region.trim()
        : region || null;
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

    persistSignupSession({
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
      error: err instanceof Error ? err.message : "Failed to sign up.",
    };
  }
}
