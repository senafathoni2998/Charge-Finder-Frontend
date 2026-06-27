import { z } from "zod";

/**
 * Single source of truth for form/route validation.
 *
 * The rule primitives (regex, lengths, messages) live here and are consumed by:
 *  - the zod field/object schemas below (RHF-ready via `zodResolver(loginSchema)`),
 *  - the `utils/validate.ts` helpers (which the hand-rolled forms + route actions
 *    still call), so there is exactly one definition of each rule.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const PASSWORD_MIN = 7;

export const EMAIL_HINT = "Example: name@email.com";
export const PASSWORD_TOO_SHORT = `Password must be at least ${PASSWORD_MIN} characters.`;
export const PASSWORD_NEEDS_DIGIT = "Add at least one number.";

// Mirror the legacy `String(value || "")` coercion so behaviour is byte-identical
// to the previous hand-rolled checks (incl. null/undefined inputs).
const toStr = (value: unknown) => String((value as string) || "");
const toTrimmed = (value: unknown) => toStr(value).trim();

export const emailSchema = z.preprocess(
  toTrimmed,
  z.string().regex(EMAIL_REGEX, EMAIL_HINT),
);

export const nameSchema = z.preprocess(
  toTrimmed,
  z.string().min(NAME_MIN).max(NAME_MAX),
);

// Signup-strength password: min length + at least one digit. (Login does NOT use
// this — it accepts legacy passwords; see loginSchema.)
export const passwordSchema = z.preprocess(
  toStr,
  z.string().min(PASSWORD_MIN, PASSWORD_TOO_SHORT).regex(/\d/, PASSWORD_NEEDS_DIGIT),
);

// Form schema (react-hook-form): fields are always strings, so it uses plain
// string checks (input type = output type = string) rather than the preprocess
// field schemas above — those exist for the null-tolerant validate.ts facades.
export const loginSchema = z.object({
  email: z.string().trim().regex(EMAIL_REGEX, "Please enter a valid email address."),
  // Presence only — never gate legacy passwords on the login path.
  password: z.string().min(1, "Please enter your password."),
});

// Signup form schema (react-hook-form). Plain string fields (input=output=string).
// name/region are non-blocking — the legacy signup action never gated on them, so
// keeping them un-validated preserves behaviour; email + password are validated and
// confirm must match the password.
export const signupFormSchema = z
  .object({
    name: z.string(),
    region: z.string(),
    email: z
      .string()
      .trim()
      .regex(EMAIL_REGEX, "Please enter a valid email address."),
    password: z
      .string()
      .min(PASSWORD_MIN, PASSWORD_TOO_SHORT)
      .regex(/\d/, PASSWORD_NEEDS_DIGIT),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

// Profile dialog (react-hook-form). Name required; region optional. Both trimmed
// to match the legacy profile action. Image is handled outside the schema.
export const editProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  region: z.string().trim(),
});

// Change-password dialog. Current password must be present; new password follows
// the signup strength rules; confirm must match; new must differ from current.
// Values are NOT trimmed (passwords are sent verbatim).
export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .refine((v) => v.trim().length > 0, "Enter your current password."),
    newPassword: z
      .string()
      .min(PASSWORD_MIN, PASSWORD_TOO_SHORT)
      .regex(/\d/, PASSWORD_NEEDS_DIGIT),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different.",
    path: ["newPassword"],
  });

// Admin "add user" form (react-hook-form).
export const addUserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be 2-50 characters.")
    .max(50, "Name must be 2-50 characters."),
  email: z
    .string()
    .trim()
    .regex(EMAIL_REGEX, "Please enter a valid email address."),
  role: z.enum(["admin", "user"]),
  password: z
    .string()
    .min(PASSWORD_MIN, PASSWORD_TOO_SHORT)
    .regex(/\d/, PASSWORD_NEEDS_DIGIT),
  region: z.string().trim().min(1, "Region is required."),
});

// Car form (AddCar + EditCar, react-hook-form). connectorTypes must have >=1;
// batteryCapacity stays a raw string here (coerced to number|null in the request).
export const carFormSchema = z.object({
  name: z.string(),
  connectorTypes: z
    .array(z.enum(["CCS2", "Type2", "CHAdeMO"]))
    .min(1, "Select at least one connector type."),
  minKW: z.number(),
  batteryCapacity: z.string(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
export type EditProfileValues = z.infer<typeof editProfileFormSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordFormSchema>;
export type AddUserFormValues = z.infer<typeof addUserFormSchema>;
export type CarFormValues = z.infer<typeof carFormSchema>;

/** First validation message for a field schema, or null when valid. */
export function firstIssue(schema: z.ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
}
