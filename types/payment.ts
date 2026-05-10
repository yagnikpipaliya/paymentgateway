/** Detected card network for badge + CVV rules. */
export enum CardType {
  Visa = "visa",
  Mastercard = "mastercard",
  Amex = "amex",
  Rupay = "rupay",
  Unknown = "unknown",
}

/** Amount currency supported in the UI (assignment minimum). */
export enum CurrencyCode {
  INR = "INR",
  USD = "USD",
}

/** UI + store lifecycle for the payment attempt (assignment: PaymentStatus). */
export enum PaymentStatus {
  Idle = "idle",
  Processing = "processing",
  Success = "success",
  Failed = "failed",
  Timeout = "timeout",
}

/** Alias used in components that speak about “lifecycle”. */
export type PaymentLifecycle = PaymentStatus;

/** Persisted transaction outcome for history (assignment fields). */
export enum TransactionStatus {
  Success = "success",
  Failed = "failed",
  Timeout = "timeout",
}

/** POST /api/pay response `outcome` field. */
export enum PayApiOutcome {
  Success = "success",
  Failed = "failed",
  Slow = "slow",
}

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  /** PAN digits only (no spaces). */
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  /** Major currency units (e.g. dollars / rupees), not minor units. */
  amount: number;
  currency: CurrencyCode;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  status: TransactionStatus;
  timestamp: string;
  failureReason?: string;
}

/** POST /api/pay success body */
export interface PaySuccessResponse {
  ok: true;
  transactionId: string;
  outcome: PayApiOutcome.Success;
}

/** POST /api/pay declined body */
export interface PayFailedResponse {
  ok: false;
  transactionId: string;
  outcome: PayApiOutcome.Failed;
  reason: string;
}

/** Returned only after the slow branch completes (usually after client abort). */
export interface PaySlowResponse {
  ok: false;
  transactionId: string;
  outcome: PayApiOutcome.Slow;
  message: string;
}

export type PayApiResponse =
  | PaySuccessResponse
  | PayFailedResponse
  | PaySlowResponse;
