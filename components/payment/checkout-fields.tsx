"use client";

import type { ChangeEventHandler, ReactElement } from "react";
import { useLayoutEffect } from "react";
import { useWatch } from "react-hook-form";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CurrencyCode } from "@/types";
import {
  detectCardType,
  digitsOnly,
  formatExpiryInput,
  maxCvvDigitsForCardType,
} from "@/utils";
import type { PaymentFormFieldRenderArgs } from "./form-fields";
import { PaymentFormField } from "./form-fields";
import type { CheckoutRhfBoundFieldProps } from "./types";

const ExpiryControl = (
  args: PaymentFormFieldRenderArgs<"expiry">,
): ReactElement => {
  const { field, fieldState, disabled: d, id, errorId } = args;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    field.onChange(formatExpiryInput(e.target.value));
  };

  return (
    <Input
      {...field}
      id={id}
      inputMode="numeric"
      autoComplete="cc-exp"
      placeholder="MM/YY"
      disabled={d}
      aria-invalid={fieldState.invalid}
      aria-describedby={errorId}
      onChange={handleChange}
      value={field.value}
    />
  );
};

type CvvControlArgs = PaymentFormFieldRenderArgs<"cvv"> & { maxLen: number };

const CvvControl = (args: CvvControlArgs): ReactElement => {
  const { field, fieldState, disabled: d, id, errorId, maxLen } = args;
  const cvvValue = field.value ?? "";
  const setCvv = field.onChange;

  useLayoutEffect(() => {
    const digits = digitsOnly(cvvValue);
    if (digits.length > maxLen) {
      setCvv(digits.slice(0, maxLen));
    }
  }, [maxLen, cvvValue, setCvv]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = digitsOnly(e.target.value).slice(0, maxLen);
    field.onChange(next);
  };

  return (
    <Input
      {...field}
      id={id}
      inputMode="numeric"
      autoComplete="cc-csc"
      maxLength={maxLen}
      disabled={d}
      aria-invalid={fieldState.invalid}
      aria-describedby={errorId}
      onChange={handleChange}
      value={field.value ?? ""}
    />
  );
};

const CurrencyControl = (
  args: PaymentFormFieldRenderArgs<"currency">,
): ReactElement => {
  const { field, fieldState, disabled: d, id, errorId } = args;

  return (
    <Select disabled={d} value={field.value} onValueChange={field.onChange}>
      <SelectTrigger
        id={id}
        aria-invalid={fieldState.invalid}
        aria-describedby={errorId}
        className="w-full"
      >
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CurrencyCode.USD}>USD</SelectItem>
        <SelectItem value={CurrencyCode.INR}>INR</SelectItem>
      </SelectContent>
    </Select>
  );
};

export type ExpiryPaymentFieldProps = CheckoutRhfBoundFieldProps;

export const ExpiryPaymentField = (
  props: ExpiryPaymentFieldProps,
): ReactElement => {
  const { control, id, disabled } = props;

  return (
    <PaymentFormField
      control={control}
      name="expiry"
      id={id}
      label="Expiry (MM/YY)"
      disabled={disabled}
      renderControl={ExpiryControl}
    />
  );
};

export type CurrencyPaymentFieldProps = CheckoutRhfBoundFieldProps;

export const CurrencyPaymentField = (
  props: CurrencyPaymentFieldProps,
): ReactElement => {
  const { control, id, disabled } = props;

  return (
    <PaymentFormField
      control={control}
      name="currency"
      id={id}
      label="Currency"
      disabled={disabled}
      renderControl={CurrencyControl}
    />
  );
};

export type CvvPaymentFieldProps = CheckoutRhfBoundFieldProps;

export const CvvPaymentField = (props: CvvPaymentFieldProps): ReactElement => {
  const { control, id, disabled } = props;
  const cardNumber = useWatch({ control, name: "cardNumber" });
  const panDigits = digitsOnly(cardNumber ?? "");
  const brand = detectCardType(panDigits);
  const maxLen = maxCvvDigitsForCardType(brand);

  return (
    <PaymentFormField
      control={control}
      name="cvv"
      id={id}
      label="CVV"
      disabled={disabled}
      renderControl={(args) => <CvvControl {...args} maxLen={maxLen} />}
    />
  );
};
