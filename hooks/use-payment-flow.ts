"use client";

import { useCallback, useRef, type RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  MAX_PAYMENT_ATTEMPTS,
  MIN_PROCESSING_DISPLAY_MS,
  USER_MESSAGES,
} from "@/constants";
import {
  createPaymentAbortHandle,
  payWithAbort,
  PayClientResultKind,
  type PayClientResult,
} from "@/services";
import { usePaymentStore } from "@/stores";
import {
  PaymentStatus,
  TransactionStatus,
  type CurrencyCode,
  type PaymentPayload,
  type Transaction,
} from "@/types";
import type { PaymentFormValues } from "@/validation";
import { digitsOnly, splitExpiryForPayload } from "@/utils";

const normalizeAmount = (raw: string): number => {
  const normalized = raw.trim().replace(/,/g, "");
  return Number.parseFloat(normalized);
};

const buildPaymentPayload = (
  values: PaymentFormValues,
  transactionId: string,
): PaymentPayload => {
  const expiryParts = splitExpiryForPayload(values.expiry);
  if (!expiryParts) {
    throw new Error("Invalid expiry.");
  }
  const panDigits = digitsOnly(values.cardNumber);
  return {
    transactionId,
    cardholderName: values.cardholderName.trim(),
    cardNumber: panDigits,
    expiryMonth: expiryParts.expiryMonth,
    expiryYear: expiryParts.expiryYear,
    cvv: values.cvv.trim(),
    amount: normalizeAmount(values.amount),
    currency: values.currency,
  };
};

const friendlyPayMessage = (result: PayClientResult): string => {
  switch (result.kind) {
    case PayClientResultKind.Network:
      return result.message;
    case PayClientResultKind.Http:
      return result.message;
    case PayClientResultKind.Parse:
      return result.message;
    default:
      return USER_MESSAGES.genericHttp;
  }
};

export const usePaymentFlow = (
  form: UseFormReturn<PaymentFormValues>,
): {
  executePayment: () => Promise<void>;
  resultRegionRef: RefObject<HTMLDivElement | null>;
} => {
  const beginNextAttempt = usePaymentStore((s) => s.beginNextAttempt);
  const setPaymentStatus = usePaymentStore((s) => s.setPaymentStatus);
  const appendTransaction = usePaymentStore((s) => s.appendTransaction);
  const setFailureReason = usePaymentStore((s) => s.setFailureReason);
  const clearActiveSession = usePaymentStore((s) => s.clearActiveSession);

  const busyRef = useRef(false);
  const resultRegionRef = useRef<HTMLDivElement>(null);

  const executePayment = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const valid = await form.trigger();
    if (!valid) {
      busyRef.current = false;
      return;
    }

    const session = beginNextAttempt();
    if (!session) {
      setFailureReason(USER_MESSAGES.terminalFailure);
      setPaymentStatus(PaymentStatus.Failed);
      busyRef.current = false;
      return;
    }

    const values = form.getValues();
    let payload: PaymentPayload;
    try {
      payload = buildPaymentPayload(values, session.transactionId);
    } catch {
      busyRef.current = false;
      return;
    }

    setPaymentStatus(PaymentStatus.Processing);

    const { controller, cancelTimer } = createPaymentAbortHandle();

    const startedAt = Date.now();
    let payResult: PayClientResult;

    try {
      payResult = await payWithAbort(payload, {
        signal: controller.signal,
      });
    } finally {
      cancelTimer();
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_PROCESSING_DISPLAY_MS) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, MIN_PROCESSING_DISPLAY_MS - elapsed);
      });
    }

    const ts = new Date().toISOString();
    const currency = values.currency as CurrencyCode;
    const amount = normalizeAmount(values.amount);

    const upsertTerminal = (tx: Transaction): void => {
      appendTransaction(tx);
    };

    if (payResult.kind === PayClientResultKind.Success) {
      upsertTerminal({
        id: payResult.transactionId,
        amount,
        currency,
        status: TransactionStatus.Success,
        timestamp: ts,
      });
      clearActiveSession();
      setPaymentStatus(PaymentStatus.Success);
      busyRef.current = false;
      return;
    }

    if (payResult.kind === PayClientResultKind.Timeout) {
      setFailureReason(USER_MESSAGES.timeout);
      setPaymentStatus(PaymentStatus.Timeout);
      if (session.attemptNumber >= MAX_PAYMENT_ATTEMPTS) {
        upsertTerminal({
          id: session.transactionId,
          amount,
          currency,
          status: TransactionStatus.Timeout,
          timestamp: ts,
        });
      }
      busyRef.current = false;
      return;
    }

    if (payResult.kind === PayClientResultKind.Failed) {
      setFailureReason(payResult.reason);
      setPaymentStatus(PaymentStatus.Failed);
      if (session.attemptNumber >= MAX_PAYMENT_ATTEMPTS) {
        upsertTerminal({
          id: payResult.transactionId,
          amount,
          currency,
          status: TransactionStatus.Failed,
          timestamp: ts,
          failureReason: payResult.reason,
        });
      }
      busyRef.current = false;
      return;
    }

    const message = friendlyPayMessage(payResult);
    setFailureReason(message);
    setPaymentStatus(PaymentStatus.Failed);

    if (session.attemptNumber >= MAX_PAYMENT_ATTEMPTS) {
      upsertTerminal({
        id: session.transactionId,
        amount,
        currency,
        status: TransactionStatus.Failed,
        timestamp: ts,
        failureReason: message,
      });
    }

    busyRef.current = false;
  }, [
    appendTransaction,
    beginNextAttempt,
    form,
    clearActiveSession,
    setFailureReason,
    setPaymentStatus,
  ]);

  return {
    executePayment,
    resultRegionRef,
  };
};
