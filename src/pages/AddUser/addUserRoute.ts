import { createUser } from "../../api/users";

export type CreateUserResult = { ok: true } | { ok: false; error: string };

/**
 * Creates a user. Field validation is handled by the form via
 * zodResolver(addUserFormSchema); navigation is the caller's responsibility.
 */
export async function createUserRequest({
  name,
  email,
  role,
  password,
  region,
}: {
  name: string;
  email: string;
  role: string;
  password: string;
  region: string;
}): Promise<CreateUserResult> {
  const result = await createUser({ name, email, role, password, region });
  if (!result.ok) {
    return { ok: false, error: result.error || "Could not add user." };
  }
  return { ok: true };
}
