import {
  emailSchema,
  nameSchema,
  passwordSchema,
  firstIssue,
} from "../forms/schemas";

// Thin facades over the zod schemas in forms/schemas.ts, which are the single
// source of truth for these rules. Signatures + messages are unchanged so the
// existing forms and route actions keep working.

export function isValidEmail(input: string) {
  return emailSchema.safeParse(input).success;
}

export function isValidName(input: string) {
  return nameSchema.safeParse(input).success;
}

export function passwordIssue(pw: string) {
  return firstIssue(passwordSchema, pw);
}

export function strengthLabel(pw: string): {
  label: string;
  tone: "weak" | "ok" | "strong";
} {
  const v = String(pw || "");
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;

  if (score <= 1) return { label: "Weak", tone: "weak" };
  if (score <= 2) return { label: "Okay", tone: "ok" };
  return { label: "Strong", tone: "strong" };
}

export function toneChipSx(tone: "weak" | "ok" | "strong") {
  if (tone === "strong") {
    return {
      borderColor: "rgba(0, 229, 255, 0.45)",
      backgroundColor: "rgba(0, 229, 255, 0.12)",
    };
  }
  if (tone === "ok") {
    return {
      borderColor: "rgba(255, 193, 7, 0.45)",
      backgroundColor: "rgba(255, 193, 7, 0.12)",
    };
  }
  return {
    borderColor: "rgba(244, 67, 54, 0.45)",
    backgroundColor: "rgba(244, 67, 54, 0.10)",
  };
}
