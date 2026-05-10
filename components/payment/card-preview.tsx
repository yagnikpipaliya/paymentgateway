"use client";

import type { ReactElement } from "react";
import { Wifi } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentCardPreviewInput } from "@/types";
import { selectCardPreviewDisplay } from "@/utils";

import { CardBrandLogo } from "./card-brand-logo";

export interface CardPreviewProps extends PaymentCardPreviewInput {
  className?: string;
}

/** Contactless — Lucide wifi, rotated to align like a card tap mark. */
const ContactlessMark = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <Wifi
    className={cn(
      "h-7 w-7 shrink-0 text-muted-foreground rotate-90",
      className,
    )}
    aria-hidden
    strokeWidth={1.5}
  />
);

export const CardPreview = (props: CardPreviewProps): ReactElement => {
  const { className, ...previewInput } = props;

  const view = selectCardPreviewDisplay(previewInput);

  return (
    <div
      role="img"
      aria-label="Card preview"
      className={cn(
        "relative isolate min-h-[220px] max-w-lg overflow-hidden rounded-xl border border-neutral-800",
        "bg-neutral-950 px-6 pb-8 pt-5 text-neutral-50 shadow-md",
        className
      )}
    >
      <div className="relative flex min-h-[188px] flex-col justify-between gap-8">
        <div className="flex items-start justify-between gap-4">
          <ContactlessMark />
          <div className="flex flex-col items-end justify-start text-right">
            {view.showDebitCreditLabel ? (
              <span className="font-sans text-[10px] font-medium uppercase tracking-card-brand text-neutral-500">
                DEBIT / CREDIT
              </span>
            ) : (
              <CardBrandLogo brand={previewInput.brand} size="lg" />
            )}
          </div>
        </div>

        <p className="font-mono text-xl tracking-card-pan text-neutral-50 sm:text-2xl">
          {view.panVisual}
        </p>

        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0 space-y-1">
            <p className="font-sans text-[10px] uppercase tracking-widest text-neutral-500">
              Cardholder
            </p>
            <p className="font-display text-sm font-semibold leading-tight tracking-wide text-balance text-neutral-50">
              {view.nameVisual}
            </p>
          </div>
          <div className="shrink-0 space-y-1 text-right">
            <p className="font-sans text-[10px] uppercase tracking-widest text-neutral-500">
              Valid thru
            </p>
            <p className="font-display text-sm font-semibold tabular-nums text-neutral-50">
              {view.expiryVisual}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
