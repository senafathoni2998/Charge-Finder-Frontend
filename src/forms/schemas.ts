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
  email: z.string().trim().regex(EMAIL_REGEX, EMAIL_HINT),
  // Presence only — never gate legacy passwords on the login path.
  password: z.string().min(1, "Please enter your password."),
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

/** First validation message for a field schema, or null when valid. */
export function firstIssue(schema: z.ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0].message;
}
