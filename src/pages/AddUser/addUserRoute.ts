import { createUser } from "../../api/users";
import i18n from "../../i18n";

export type CreateUserResult = { ok: true } | { ok: false; error: string };

/**
 * Creates a user. Field validation is handled by the form via
 * zodResolver(addUserFormSchema); navigation is the caller's responsibility.
 */
export async function createUserRequest(
  {
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
  },
  fallbackError = i18n.t("users.addFailed", { ns: "api" }),
): Promise<CreateUserResult> {
  const result = await createUser({ name, email, role, password, region });
  if (!result.ok) {
    return { ok: false, error: result.error || fallbackError };
  }
  return { ok: true };
}
