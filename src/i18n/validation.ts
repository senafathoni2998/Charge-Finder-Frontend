import type { TFunction } from "i18next";

/**
 * Bridge between the (English) zod/validate messages in `forms/schemas.ts` and
 * the translated `validation` namespace.
 *
 * The schemas stay the single source of truth and keep emitting their English
 * messages verbatim (so `firstIssue`, `utils/validate.ts`, and their tests are
 * untouched). At every *display* site we run the message through
 * `tValidation`, which maps the known English message to its translation slug.
 * Unknown messages (e.g. server-provided errors) fall through unchanged.
 */
const MESSAGE_TO_SLUG: Record<string, string> = {
  "Example: name@email.com": "emailExample",
  "Password must be at least 7 characters.": "passwordTooShort",
  "Add at least one number.": "passwordNeedsDigit",
  "Please enter a valid email address.": "emailInvalid",
  "Please enter your password.": "passwordRequired",
  "Passwords do not match.": "passwordsNoMatch",
  "Name is required.": "nameRequired",
  "Enter your current password.": "currentPasswordRequired",
  "New password must be different.": "newPasswordDifferent",
  "Name must be 2-50 characters.": "nameLength",
  "Region is required.": "regionRequired",
  "Select at least one connector type.": "connectorRequired",
  "Station name is required.": "stationNameRequired",
  "Address is required.": "addressRequired",
  "Latitude and longitude must be valid numbers.": "latLngInvalid",
  "Add at least one valid connector entry.": "connectorEntryInvalid",
  "Pricing currency and per kWh are required.": "pricingRequired",
};

/**
 * Translate a validation message produced by the form schemas.
 *
 * @param t        a `t` function from `useTranslation()` (any namespace — this
 *                 addresses the `validation` namespace explicitly).
 * @param message  the raw message from RHF/zod/validate, may be undefined.
 * @returns        the localized message, or the original string when unknown,
 *                 or "" when there is no message.
 */
export function tValidation(
  t: TFunction,
  message?: string | null,
): string {
  if (!message) return "";
  const slug = MESSAGE_TO_SLUG[message];
  return slug ? t(slug, { ns: "validation" }) : message;
}
