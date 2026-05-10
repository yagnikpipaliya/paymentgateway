"use client";

import { useCallback, useMemo, type RefObject } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";

import { usePaymentStore } from "@/stores";
import { CardType, PaymentStatus } from "@/types";
import { detectCardType } from "@/utils";
import {
  PAYMENT_FORM_DEFAULTS,
  paymentFormSchema,
  type PaymentFormValues,
} from "@/validation";
import { useFocusOnPaymentResult } from "./use-focus-on-status";
import { usePaymentFlow } from "./use-payment-flow";

export interface PaymentCheckoutState {
  form: UseFormReturn<PaymentFormValues>;
  paymentStatus: PaymentStatus;
  attemptNumber: number;
  failureReason: string | null;
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  brand: CardType;
  fieldsDisabled: boolean;
  submitDisabled: boolean;
  primaryButtonLabel: string;
  showPreviewSkeleton: boolean;
  onSubmit: ReturnType<UseFormReturn<PaymentFormValues>["handleSubmit"]>;
  retryPayment: () => void;
  startNewPayment: () => void;
  dismissSuccess: () => void;
  resultRegionRef: RefObject<HTMLDivElement | null>;
}

/**
 * Encapsulates checkout form setup, Zustand bindings, payment execution, and derived UI flags.
 * Consume via `PaymentCheckoutProvider` + `usePaymentCheckout` — keep JSX free of this orchestration.
 */
export const usePaymentCheckoutState = (): PaymentCheckoutState => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: PAYMENT_FORM_DEFAULTS,
  });

  const paymentStatus = usePaymentStore((s) => s.paymentStatus);
  const attemptNumber = usePaymentStore((s) => s.attemptNumber);
  const failureReason = usePaymentStore((s) => s.lastFailureReason);
  const resetAfterSuccess = usePaymentStore((s) => s.resetAfterSuccess);

  const { executePayment, resultRegionRef } = usePaymentFlow(form);
  useFocusOnPaymentResult(paymentStatus, resultRegionRef);

  const cardNumber = useWatch({ control: form.control, name: "cardNumber" });
  const cardholderName = useWatch({
    control: form.control,
    name: "cardholderName",
  });
  const expiry = useWatch({ control: form.control, name: "expiry" });

  const brand = useMemo(
    () => detectCardType(cardNumber ?? ""),
    [cardNumber]
  );

  const fieldsDisabled = paymentStatus === PaymentStatus.Processing;
  const submitDisabled =
    !form.formState.isValid ||
    fieldsDisabled ||
    paymentStatus === PaymentStatus.Success;

  const primaryButtonLabel =
    paymentStatus === PaymentStatus.Processing
      ? "Processing payment..."
      : "Pay securely";

  const showPreviewSkeleton = paymentStatus === PaymentStatus.Processing;

  const runPay = useCallback(async () => {
    await executePayment();
  }, [executePayment]);

  const onSubmit = useMemo(
    () => form.handleSubmit(runPay),
    [form, runPay]
  );

  const resetFormToDefaults = useCallback(() => {
    form.reset(PAYMENT_FORM_DEFAULTS);
  }, [form]);

  const startNewPayment = useCallback(() => {
    resetAfterSuccess();
    resetFormToDefaults();
  }, [resetAfterSuccess, resetFormToDefaults]);

  const dismissSuccess = useCallback(() => {
    resetAfterSuccess();
    resetFormToDefaults();
  }, [resetAfterSuccess, resetFormToDefaults]);

  const retryPayment = useCallback(() => {
    void executePayment();
  }, [executePayment]);

  return {
    form,
    paymentStatus,
    attemptNumber,
    failureReason,
    cardNumber: cardNumber ?? "",
    cardholderName: cardholderName ?? "",
    expiry: expiry ?? "",
    brand,
    fieldsDisabled,
    submitDisabled,
    primaryButtonLabel,
    showPreviewSkeleton,
    onSubmit,
    retryPayment,
    startNewPayment,
    dismissSuccess,
    resultRegionRef,
  };
};
