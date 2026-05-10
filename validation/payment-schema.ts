import { z } from "zod/v3";

import { CardType, CurrencyCode } from "@/types";
import {
  detectCardType,
  isAmexBrand,
  digitsOnly,
  maxPanDigitsForBrand,
  isExpiryInPast,
  parseExpiryMmYy,
  passesLuhn,
} from "@/utils";

export const currencySchema = z.nativeEnum(CurrencyCode);

/**
 * Single schema for the checkout form (assignment: one validation source / DRY).
 * Validates formatted PAN (with spaces), expiry as MM/YY, and CVV rules per brand.
 */
export const paymentFormSchema = z
  .object({
    cardholderName: z
      .string()
      .trim()
      .min(2, "Enter the name as it appears on the card."),
    cardNumber: z.string().min(1, "Enter the card number."),
    expiry: z.string().min(1, "Enter the expiry date."),
    cvv: z.string().min(1, "Enter the CVV."),
    amount: z.string().min(1, "Enter an amount."),
    currency: currencySchema,
  })
  .superRefine((data, ctx) => {
    const panDigits = digitsOnly(data.cardNumber);
    const brand = detectCardType(panDigits);
    const amex = isAmexBrand(brand);

    const maxDigits =
      brand === CardType.Unknown ? 19 : maxPanDigitsForBrand(brand);
    const minDigits =
      brand === CardType.Amex
        ? 15
        : brand === CardType.Visa
          ? 13
          : brand === CardType.Mastercard
            ? 16
            : brand === CardType.Rupay
              ? 16
              : 13;

    if (panDigits.length > 0 && panDigits.length < minDigits) {
      ctx.addIssue({
        code: "custom",
        path: ["cardNumber"],
        message: "Enter a complete card number.",
      });
    }
    if (panDigits.length > maxDigits) {
      ctx.addIssue({
        code: "custom",
        path: ["cardNumber"],
        message: "This card number looks too long for the detected card type.",
      });
    }

    if (
      panDigits.length >= minDigits &&
      panDigits.length <= maxDigits &&
      brand !== CardType.Unknown
    ) {
      if (!passesLuhn(panDigits)) {
        ctx.addIssue({
          code: "custom",
          path: ["cardNumber"],
          message: "Card number does not pass validation. Double-check the digits.",
        });
      }
    }

    if (!parseExpiryMmYy(data.expiry)) {
      ctx.addIssue({
        code: "custom",
        path: ["expiry"],
        message: "Use MM/YY format.",
      });
    } else if (isExpiryInPast(data.expiry)) {
      ctx.addIssue({
        code: "custom",
        path: ["expiry"],
        message: "Expiry date cannot be in the past.",
      });
    }

    const cvvLen = data.cvv.trim().length;
    const expected = amex ? 4 : 3;
    if (!/^\d+$/.test(data.cvv.trim())) {
      ctx.addIssue({
        code: "custom",
        path: ["cvv"],
        message: "CVV must contain digits only.",
      });
    } else if (cvvLen !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["cvv"],
        message:
          expected === 4
            ? "American Express cards use a 4-digit CVV."
            : "CVV must be 3 digits for this card.",
      });
    }

    const normalizedAmount = data.amount.trim().replace(/,/g, "");
    const amountNum = Number.parseFloat(normalizedAmount);
    if (Number.isNaN(amountNum) || normalizedAmount === "") {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Enter a valid amount.",
      });
    } else if (amountNum <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Amount must be greater than zero.",
      });
    }
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export const PAYMENT_FORM_DEFAULTS: PaymentFormValues = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: CurrencyCode.USD,
};
