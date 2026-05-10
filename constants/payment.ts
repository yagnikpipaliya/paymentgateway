import { CardType } from "@/types";

/** Human-readable card network names (form badge / labels). */
export const CARD_TYPE_LABELS: Record<
  Exclude<CardType, CardType.Unknown>,
  string
> = {
  [CardType.Visa]: "Visa",
  [CardType.Mastercard]: "Mastercard",
  [CardType.Amex]: "American Express",
  [CardType.Rupay]: "RuPay",
};

/** Client-side request abort timeout (assignment). */
export const CLIENT_TIMEOUT_MS = 6000;

/** Minimum time to show the processing UI after submit (assignment). */
export const MIN_PROCESSING_DISPLAY_MS = 2000;

/** Max retry attempts per transaction id (assignment). */
export const MAX_PAYMENT_ATTEMPTS = 3;

/** Server-side simulated slow response delay (assignment). */
export const SERVER_SLOW_RESPONSE_MS = 8000;

export const USER_MESSAGES = {
  network:
    "We could not reach the payment service. Check your connection and try again.",
  genericHttp: "The payment service returned an unexpected response.",
  aborted: "The request took too long and was cancelled to protect your session.",
  timeout:
    "The payment gateway did not respond in time. You can retry without entering your card again.",
  parseError: "We could not read the payment response. Please try again.",
  terminalFailure:
    "This payment could not be completed after multiple attempts. Start a new payment or contact support.",
} as const;
