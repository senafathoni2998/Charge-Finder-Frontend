import { apiRequest } from "./client";

type FetchUsersResult = {
  ok: boolean;
  users: unknown[];
  error?: string;
};

type PatchUserResult = {
  ok: boolean;
  user: unknown | null;
  error?: string;
};

type CreateUserResult = {
  ok: boolean;
  user: unknown | null;
  error?: string;
};

type DeleteUserResult = {
  ok: boolean;
  error?: string;
};

type CreateUserPayload = {
  name: string;
  email: string;
  role: string;
  password?: string;
  region?: string;
  signal?: AbortSignal;
};

type PatchUserPayload = {
  userId: string;
  data: Record<string, unknown>;
  signal?: AbortSignal;
};

// Loads users from the backend, returning an empty list on failures.
export const fetchUsers = async (
  signal?: AbortSignal
): Promise<FetchUsersResult> => {
  const res = await apiRequest<{ users?: unknown[] }>("/admin/users", {
    method: "GET",
    signal,
    fallbackError: "Could not load users.",
  });
  if (!res.ok) {
    return { ok: false, users: [], error: res.error };
  }
  const users = Array.isArray(res.data?.users) ? res.data.users : [];
  return { ok: true, users };
};

// Updates a user using admin credentials.
export const patchUser = async ({
  userId,
  data,
  signal,
}: PatchUserPayload): Promise<PatchUserResult> => {
  if (!userId) {
    return { ok: false, user: null, error: "User ID is missing." };
  }

  const res = await apiRequest<{ user?: unknown; updatedUser?: unknown }>(
    `/admin/users/${userId}`,
    { method: "PATCH", body: data, signal, fallbackError: "Could not update user." }
  );
  if (!res.ok) {
    return { ok: false, user: null, error: res.error };
  }
  return { ok: true, user: res.data?.user ?? res.data?.updatedUser ?? null };
};

// Deletes a user using admin credentials.
export const deleteUser = async (
  userId: string,
  signal?: AbortSignal
): Promise<DeleteUserResult> => {
  if (!userId) {
    return { ok: false, error: "User ID is missing." };
  }

  const res = await apiRequest(`/admin/users/${userId}`, {
    method: "DELETE",
    signal,
    fallbackError: "Could not delete user.",
  });
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return { ok: true };
};

// Creates a user using admin credentials.
export const createUser = async ({
  name,
  email,
  role,
  password,
  region,
  signal,
}: CreateUserPayload): Promise<CreateUserResult> => {
  const res = await apiRequest<{ user?: unknown; createdUser?: unknown }>(
    "/admin/users",
    {
      method: "POST",
      body: { name, email, role, password, region },
      signal,
      fallbackError: "Could not create user.",
    }
  );
  if (!res.ok) {
    return { ok: false, user: null, error: res.error };
  }
  return { ok: true, user: res.data?.user ?? res.data?.createdUser ?? null };
};
