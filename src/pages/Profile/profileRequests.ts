import i18n from "../../i18n";

export type ProfileRequestResult = { ok: true } | { ok: false; error: string };

/**
 * Updates the profile (name/region/optional image). Field validation (name
 * required) is handled by the form via zodResolver(editProfileFormSchema); the
 * image-type guard stays here because the File is outside the schema.
 */
export async function updateProfileRequest({
  userId,
  name,
  region,
  image,
}: {
  userId: string;
  name: string;
  region: string;
  image: File | null;
}): Promise<ProfileRequestResult> {
  if (!userId) {
    return { ok: false, error: i18n.t("session.userMissing", { ns: "api" }) };
  }
  if (image && !image.type.startsWith("image/")) {
    return { ok: false, error: i18n.t("profile.photoMustBeImage", { ns: "api" }) };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: i18n.t("client.backendNotConfigured", { ns: "api" }) };
  }

  try {
    const payload = new FormData();
    payload.append("userId", userId);
    payload.append("name", name);
    if (region) payload.append("region", region);
    if (image) payload.append("image", image);

    const response = await fetch(`${baseUrl}/profile/update-profile`, {
      method: "PATCH",
      body: payload,
      credentials: "include",
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: responseData.message || i18n.t("profile.updateFailed", { ns: "api" }),
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : i18n.t("profile.updateFailed", { ns: "api" }),
    };
  }
}

/**
 * Changes the password. Field validation (presence, strength, match, different)
 * is handled by the form via zodResolver(changePasswordFormSchema).
 */
export async function changePasswordRequest({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<ProfileRequestResult> {
  if (!userId) {
    return { ok: false, error: i18n.t("session.userMissing", { ns: "api" }) };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: i18n.t("client.backendNotConfigured", { ns: "api" }) };
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
        ok: false,
        error: responseData.message || i18n.t("profile.passwordUpdateFailed", { ns: "api" }),
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : i18n.t("profile.passwordUpdateFailed", { ns: "api" }),
    };
  }
}
