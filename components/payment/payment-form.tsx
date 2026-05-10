"use client";

import type { ReactElement } from "react";

import {
  Button,
  FieldGroup,
  Skeleton,
} from "@/components/ui";
import { PaymentCheckoutProvider, usePaymentCheckout } from "@/contexts";
import { CardNumberField } from "./card-input";
import { CardPreview } from "./card-preview";
import {
  CurrencyPaymentField,
  CvvPaymentField,
  ExpiryPaymentField,
} from "./checkout-fields";
import { PaymentFormField } from "./form-fields";
import { StatusScreen } from "./status-screen";

export const PaymentForm = (): ReactElement => (
  <PaymentCheckoutProvider>
    <PaymentFormLayout />
  </PaymentCheckoutProvider>
);

/**
 * Presentational layout only — bindings come from `usePaymentCheckout` / `usePaymentCheckoutState`.
 */
const PaymentFormLayout = (): ReactElement => {
  const {
    form,
    onSubmit,
    fieldsDisabled: disabled,
    cardNumber,
    cardholderName,
    expiry,
    brand,
    paymentStatus,
    attemptNumber,
    failureReason,
    submitDisabled,
    primaryButtonLabel,
    showPreviewSkeleton,
    retryPayment,
    startNewPayment,
    dismissSuccess,
    resultRegionRef,
  } = usePaymentCheckout();

  return (
    <div className="space-y-8">
      <div className="grid gap-8 checkout-grid-cols">
        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <FieldGroup className="font-sans">
            <div className="space-y-1.5 font-display">
              <h2 className="text-lg font-semibold tracking-tight">Payment</h2>
              <p className="text-sm text-muted-foreground">
                All fields are validated in real time (blur + change) with the
                same Zod schema used for submission.
              </p>
            </div>

            <PaymentFormField
              control={form.control}
              name="cardholderName"
              id="cardholderName"
              label="Name on card"
              disabled={disabled}
              inputProps={{ autoComplete: "cc-name" }}
            />

            <CardNumberField
              control={form.control}
              name="cardNumber"
              id="cardNumber"
              disabled={disabled}
            />

            <ExpiryPaymentField
              control={form.control}
              id="expiry"
              disabled={disabled}
            />

            <CvvPaymentField control={form.control} id="cvv" disabled={disabled} />

            <div className="grid gap-4 sm:grid-cols-2">
              <CurrencyPaymentField
                control={form.control}
                id="currency"
                disabled={disabled}
              />

              <PaymentFormField
                control={form.control}
                name="amount"
                id="amount"
                label="Amount"
                disabled={disabled}
                inputProps={{ inputMode: "decimal" }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg" disabled={submitDisabled}>
                {primaryButtonLabel}
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="space-y-4">
          {showPreviewSkeleton ? (
            <div className="space-y-3">
              <Skeleton className="h-56 w-full rounded-xl" />
              <p className="font-sans text-sm text-muted-foreground">
                Contacting the simulated gateway — slow networks stay blocked by a
                client-side safeguard.
              </p>
            </div>
          ) : (
            <CardPreview
              brand={brand}
              cardNumberDisplay={cardNumber}
              cardholderName={cardholderName}
              expiry={expiry}
            />
          )}
        </div>
      </div>

      <StatusScreen
        status={paymentStatus}
        attemptNumber={attemptNumber}
        failureReason={failureReason}
        onDismissSuccess={dismissSuccess}
        onRetry={retryPayment}
        onNewPayment={startNewPayment}
        regionRef={resultRegionRef}
      />
    </div>
  );
};
