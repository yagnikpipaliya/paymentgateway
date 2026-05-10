"use client";

import type { ReactElement } from "react";

import AmexSvg from "@/assets/card-brands/amex.svg";
import MastercardSvg from "@/assets/card-brands/mastercard.svg";
import RupaySvg from "@/assets/card-brands/rupay.svg";
import VisaSvg from "@/assets/card-brands/visa.svg";
import { cn } from "@/lib/utils";
import { CardType } from "@/types";

const sizeCls = {
  /** Inline next to compact inputs (checkout row). */
  sm: "block h-6 max-h-6 w-auto max-w-[72px] [&>svg]:block [&>svg]:h-full [&>svg]:max-h-6 [&>svg]:w-auto",
  default:
    "block h-8 max-h-8 w-auto max-w-[100px] [&>svg]:block [&>svg]:h-full [&>svg]:max-h-8 [&>svg]:w-auto",
  lg: "block h-12 max-h-12 w-auto max-w-[152px] [&>svg]:block [&>svg]:h-full [&>svg]:max-h-12 [&>svg]:w-auto",
} as const;

export interface CardBrandLogoProps {
  brand: CardType;
  className?: string;
  /** Larger mark for the physical card preview. */
  size?: keyof typeof sizeCls;
}

export const CardBrandLogo = (
  props: CardBrandLogoProps,
): ReactElement | null => {
  const { brand, className, size = "default" } = props;

  const common = cn(sizeCls[size], className);

  switch (brand) {
    case CardType.Visa:
      return (
        <VisaSvg
          className={cn(common, "text-foreground [&_svg]:text-current")}
          aria-hidden
        />
      );
    case CardType.Mastercard:
      return <MastercardSvg className={common} aria-hidden />;
    case CardType.Amex:
      return <AmexSvg className={common} aria-hidden />;
    case CardType.Rupay:
      return <RupaySvg className={common} aria-hidden />;
    default:
      return null;
  }
};
