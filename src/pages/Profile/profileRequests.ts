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
    return { ok: false, error: "User session is missing." };
  }
  if (image && !image.type.startsWith("image/")) {
    return { ok: false, error: "Profile photo must be an image file." };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
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
        error: responseData.message || "Could not update profile.",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not update profile.",
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
    return { ok: false, error: "User session is missing." };
  }

  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
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
        error: responseData.message || "Failed to update password.",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update password.",
    };
  }
}
