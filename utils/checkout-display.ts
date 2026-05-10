import { MAX_PAYMENT_ATTEMPTS } from "@/constants";
import { CardType, PaymentStatus, type PaymentCardPreviewInput } from "@/types";

import { digitsOnly, formatCardNumberDisplay } from "./payment-pan";

// --- Card preview view model ------------------------------------------------

export interface CardPreviewDisplayModel {
  panVisual: string;
  nameVisual: string;
  expiryVisual: string;
  showDebitCreditLabel: boolean;
}

/** Pure view model for the physical card preview (no React). */
export const selectCardPreviewDisplay = (
  input: PaymentCardPreviewInput,
): CardPreviewDisplayModel => {
  const digits = digitsOnly(input.cardNumberDisplay);
  const panVisual =
    digits.length > 0 ? formatCardNumberDisplay(digits) : "•••• •••• •••• ••••";

  const nameVisual =
    input.cardholderName.trim().length > 0
      ? input.cardholderName.toUpperCase()
      : "CARDHOLDER NAME";

  const expiryVisual =
    input.expiry.trim().length > 0 ? input.expiry : "MM/YY";

  return {
    panVisual,
    nameVisual,
    expiryVisual,
    showDebitCreditLabel: input.brand === CardType.Unknown,
  };
};

// --- Status strip phase -----------------------------------------------------

/** Which outcome panel to show on the checkout status strip. */
export enum StatusScreenPhaseKind {
  Idle = "idle",
  Success = "success",
  Failed = "failed",
  Timeout = "timeout",
}

export type StatusScreenPhase =
  | { kind: StatusScreenPhaseKind.Idle }
  | { kind: StatusScreenPhaseKind.Success }
  | {
      kind: StatusScreenPhaseKind.Failed;
      retriesExhausted: boolean;
      canRetry: boolean;
    }
  | {
      kind: StatusScreenPhaseKind.Timeout;
      retriesExhausted: boolean;
      canRetry: boolean;
    };

/** Payment outcome UI state — keep branching out of JSX. */
export const resolveStatusScreenPhase = (
  status: PaymentStatus,
  attemptNumber: number,
): StatusScreenPhase => {
  if (
    status === PaymentStatus.Idle ||
    status === PaymentStatus.Processing
  ) {
    return { kind: StatusScreenPhaseKind.Idle };
  }

  const retriesExhausted = attemptNumber >= MAX_PAYMENT_ATTEMPTS;
  const canRetry =
    (status === PaymentStatus.Failed || status === PaymentStatus.Timeout) &&
    !retriesExhausted;

  switch (status) {
    case PaymentStatus.Success:
      return { kind: StatusScreenPhaseKind.Success };
    case PaymentStatus.Failed:
      return {
        kind: StatusScreenPhaseKind.Failed,
        retriesExhausted,
        canRetry,
      };
    case PaymentStatus.Timeout:
      return {
        kind: StatusScreenPhaseKind.Timeout,
        retriesExhausted,
        canRetry,
      };
    default:
      return { kind: StatusScreenPhaseKind.Idle };
  }
};

// --- Transaction history formatting -----------------------------------------

/** Locale display for demo transaction rows / detail. */
export const formatTransactionTimestamp = (
  timestamp: string | number | Date,
): string => new Date(timestamp).toLocaleString();
