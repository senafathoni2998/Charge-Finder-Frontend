import type { TFunction } from "i18next";
import type { PaymentMethod } from "./types";

// Default "notify me at battery %" threshold when the user first enables it.
export const DEFAULT_NOTIFY_AT_PERCENT = 80;

// Payment methods shown in the ticket purchase dialog.
export const getPaymentMethods = (t: TFunction): PaymentMethod[] => [
  {
    id: "card",
    label: t("constants.payment.cardLabel"),
    helper: t("constants.payment.cardHelper"),
  },
  {
    id: "ewallet",
    label: t("constants.payment.ewalletLabel"),
    helper: t("constants.payment.ewalletHelper"),
  },
  {
    id: "bank",
    label: t("constants.payment.bankLabel"),
    helper: t("constants.payment.bankHelper"),
  },
];

// Issue types offered in the report dialog.
export const getReportIssueTypes = (t: TFunction): string[] => [
  t("constants.report.brokenConnector"),
  t("constants.report.occupied"),
  t("constants.report.paymentProblem"),
  t("constants.report.stationOffline"),
  t("constants.report.other"),
];

// Default ticket size and estimated session length.
export const TICKET_KWH = 20;
export const TOTAL_CHARGE_MINUTES = 0;
