"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
} from "react-hook-form";

import { Field, FieldError, FieldLabel, Input } from "@/components/ui";
import type { PaymentFormValues } from "@/validation";

export interface PaymentFormFieldRenderArgs<
  TName extends FieldPath<PaymentFormValues>,
> {
  field: ControllerRenderProps<PaymentFormValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  id: string;
  errorId: string;
}

type InputPassThrough = Omit<
  ComponentProps<typeof Input>,
  | "id"
  | "disabled"
  | "aria-invalid"
  | "aria-describedby"
  | "name"
  | "value"
  | "onChange"
  | "onBlur"
  | "ref"
>;

export interface PaymentFormFieldProps<
  TName extends FieldPath<PaymentFormValues>,
> {
  control: Control<PaymentFormValues>;
  name: TName;
  id: string;
  label: ReactNode;
  disabled?: boolean;
  /**
   * Custom control (Input, Select, mask, etc.). When omitted, a default `Input`
   * is rendered and `inputProps` are merged after RHF `field`.
   */
  renderControl?: (args: PaymentFormFieldRenderArgs<TName>) => ReactNode;
  /** Used only when `renderControl` is not provided. */
  inputProps?: InputPassThrough;
}

/**
 * Single shell for checkout fields: Field + label + Controller + FieldError.
 * One code path via `Controller` for every scenario.
 */
export const PaymentFormField = <
  TName extends FieldPath<PaymentFormValues>,
>(
  props: PaymentFormFieldProps<TName>,
): ReactElement => {
  const { control, name, id, label, disabled, renderControl, inputProps } =
    props;
  const errorId = `${id}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const args: PaymentFormFieldRenderArgs<TName> = {
          field,
          fieldState,
          disabled: !!disabled,
          id,
          errorId,
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {renderControl ? (
              renderControl(args)
            ) : (
              <Input
                id={id}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                aria-describedby={errorId}
                {...field}
                value={(field.value ?? "") as string}
                {...inputProps}
              />
            )}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
};
