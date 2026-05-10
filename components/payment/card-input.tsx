"use client";

import { useMemo, type ReactElement } from "react";
import { Badge, Input } from "@/components/ui";
import { CARD_TYPE_LABELS } from "@/constants";
import { CardType } from "@/types";
import { analyzeCardNumberInput, formatCardNumberFromUserInput } from "@/utils";

import { CardBrandLogo } from "./card-brand-logo";
import type { PaymentFormFieldRenderArgs } from "./form-fields";
import { PaymentFormField } from "./form-fields";
import type { CheckoutRhfBoundFieldProps } from "./types";

const CardNumberControl = (
  args: PaymentFormFieldRenderArgs<"cardNumber">,
): ReactElement => {
  const { field, fieldState, disabled: d, id, errorId } = args;

  const { brand, maxDigits } = useMemo(
    () => analyzeCardNumberInput(field.value ?? ""),
    [field.value],
  );

  const handleRawChange = (raw: string): void => {
    field.onChange(formatCardNumberFromUserInput(raw, maxDigits));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        {...field}
        id={id}
        inputMode="numeric"
        autoComplete="cc-number"
        aria-invalid={fieldState.invalid}
        aria-describedby={errorId}
        disabled={d}
        placeholder="4242 4242 4242 4242"
        value={field.value ?? ""}
        onChange={(e) => handleRawChange(e.target.value)}
      />
      {brand !== CardType.Unknown ? (
        <>
          <CardBrandLogo brand={brand} size="sm" />
          <Badge variant="secondary">{CARD_TYPE_LABELS[brand]}</Badge>
        </>
      ) : (
        <Badge variant="outline">Card</Badge>
      )}
    </div>
  );
};

export interface CardNumberFieldProps extends CheckoutRhfBoundFieldProps {
  name: "cardNumber";
}

export const CardNumberField = (
  props: CardNumberFieldProps,
): ReactElement => {
  const { control, name, id, disabled } = props;

  return (
    <PaymentFormField
      control={control}
      name={name}
      id={id}
      label="Card number"
      disabled={disabled}
      renderControl={CardNumberControl}
    />
  );
};
