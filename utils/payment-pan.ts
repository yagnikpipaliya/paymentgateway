import { CardType } from "@/types";

// --- Format & length caps -------------------------------------------------

/** Strip non-digits from PAN input. */
export const digitsOnly = (value: string): string =>
  value.replace(/\D/g, "");

/** Insert spaces every 4 digits for display (assignment). */
export const formatCardNumberDisplay = (rawDigits: string): string => {
  const d = digitsOnly(rawDigits).slice(0, 19);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

/** Max digits allowed while typing (Visa supports up to 19 digits). */
export const maxPanDigitsForBrand = (cardType: CardType): number => {
  if (cardType === CardType.Amex) return 15;
  if (cardType === CardType.Visa) return 19;
  return 16;
};

// --- Luhn -----------------------------------------------------------------

/** Luhn check for primary account numbers (optional hardening). */
export const passesLuhn = (panDigits: string): boolean => {
  const d = digitsOnly(panDigits);
  if (d.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number.parseInt(d[i], 10);
    if (Number.isNaN(n)) return false;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

// --- Brand detection ------------------------------------------------------

/**
 * RuPay IIN prefixes (NPCI domestic / co-badged; subset for this demo).
 * See NPCI issuer identification documentation for full tables.
 */
const isRupayPrefix = (d: string): boolean => {
  if (d.length < 3) return false;
  if (d.startsWith("6521") || d.startsWith("6522")) return true;
  if (d.startsWith("607")) return true;
  if (d.startsWith("817")) return true;
  return false;
};

/**
 * Infer card network from PAN prefix (Visa / Mastercard / Amex / RuPay).
 * Returns unknown when insufficient digits.
 */
export const detectCardType = (panDigits: string): CardType => {
  const d = digitsOnly(panDigits);
  if (d.length === 0) return CardType.Unknown;

  if (d.startsWith("4")) return CardType.Visa;

  const firstTwo = Number.parseInt(d.slice(0, 2), 10);
  const firstFour = Number.parseInt(d.slice(0, 4), 10);
  if (!Number.isNaN(firstTwo)) {
    if (firstTwo >= 51 && firstTwo <= 55) return CardType.Mastercard;
    if (firstTwo === 34 || firstTwo === 37) return CardType.Amex;
  }
  if (!Number.isNaN(firstFour)) {
    if (firstFour >= 2221 && firstFour <= 2720) return CardType.Mastercard;
  }

  if (isRupayPrefix(d)) return CardType.Rupay;

  return CardType.Unknown;
};

export const isAmexBrand = (cardType: CardType): boolean =>
  cardType === CardType.Amex;

/** Amex uses 4-digit CVV; Visa, Mastercard, RuPay, and unknown use 3. */
export const maxCvvDigitsForCardType = (cardType: CardType): number =>
  isAmexBrand(cardType) ? 4 : 3;

// --- Input analysis --------------------------------------------------------

export interface CardNumberInputAnalysis {
  brand: CardType;
  maxDigits: number;
}

/** Pure analysis for PAN display + length cap (no React). */
export const analyzeCardNumberInput = (value: string): CardNumberInputAnalysis => {
  const panDigits = digitsOnly(value);
  const brand = detectCardType(panDigits);
  const maxDigits =
    brand === CardType.Unknown ? 19 : maxPanDigitsForBrand(brand);
  return { brand, maxDigits };
};

/** Map raw keyboard/paste input to stored formatted PAN. */
export const formatCardNumberFromUserInput = (
  raw: string,
  maxDigits: number,
): string => {
  const nextDigits = digitsOnly(raw).slice(0, maxDigits);
  return formatCardNumberDisplay(nextDigits);
};
