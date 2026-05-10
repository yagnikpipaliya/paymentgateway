import type { CardType } from "./payment";

/** Shared shape for live card preview props and `selectCardPreviewDisplay`. */
export interface PaymentCardPreviewInput {
  cardholderName: string;
  cardNumberDisplay: string;
  expiry: string;
  brand: CardType;
}
