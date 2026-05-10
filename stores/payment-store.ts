import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MAX_PAYMENT_ATTEMPTS } from "@/constants";
import { PaymentStatus, type CurrencyCode, type Transaction } from "@/types";

export interface PaymentSessionState {
  paymentStatus: PaymentStatus;
  /** Active idempotency key for the current checkout session (assignment). */
  activeTransactionId: string | null;
  /** Attempt index for the active session (1…MAX_PAYMENT_ATTEMPTS). */
  attemptNumber: number;
  lastFailureReason: string | null;
  transactions: Transaction[];
}

export interface PaymentActions {
  setPaymentStatus: (status: PaymentStatus) => void;
  resetFlowToIdle: () => void;
  /** Clears idempotency session fields without hiding terminal UI (call after success append). */
  clearActiveSession: () => void;
  /** Full reset when shopper starts another payment from the success screen. */
  resetAfterSuccess: () => void;
  /** Prepare the next gateway attempt; mints `crypto.randomUUID()` on first attempt only. */
  beginNextAttempt: () => { transactionId: string; attemptNumber: number } | null;
  appendTransaction: (tx: Transaction) => void;
  setFailureReason: (reason: string | null) => void;
}

export type PaymentStore = PaymentSessionState & PaymentActions;

const initialSession = (): PaymentSessionState => ({
  paymentStatus: PaymentStatus.Idle,
  activeTransactionId: null,
  attemptNumber: 0,
  lastFailureReason: null,
  transactions: [],
});

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      ...initialSession(),
      setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
      resetFlowToIdle: () =>
        set({
          paymentStatus: PaymentStatus.Idle,
          lastFailureReason: null,
        }),
      clearActiveSession: () =>
        set({
          activeTransactionId: null,
          attemptNumber: 0,
          lastFailureReason: null,
        }),
      resetAfterSuccess: () =>
        set({
          paymentStatus: PaymentStatus.Idle,
          activeTransactionId: null,
          attemptNumber: 0,
          lastFailureReason: null,
        }),
      beginNextAttempt: () => {
        const state = get();
        let transactionId = state.activeTransactionId;
        let attemptNumber = state.attemptNumber;

        if (!transactionId) {
          transactionId = crypto.randomUUID();
          attemptNumber = 1;
        } else {
          attemptNumber += 1;
        }

        if (attemptNumber > MAX_PAYMENT_ATTEMPTS) {
          return null;
        }

        set({
          activeTransactionId: transactionId,
          attemptNumber,
          lastFailureReason: null,
        });

        return { transactionId, attemptNumber };
      },
      appendTransaction: (tx) =>
        set((s) => ({
          transactions: [
            tx,
            ...s.transactions.filter((existing) => existing.id !== tx.id),
          ],
        })),
      setFailureReason: (lastFailureReason) => set({ lastFailureReason }),
    }),
    {
      name: "payment-gateway-storage",
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    }
  )
);

export function formatMoney(amount: number, currency: CurrencyCode): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
