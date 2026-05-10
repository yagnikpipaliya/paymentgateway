"use client";

import { useEffect, type RefObject } from "react";

import { PaymentStatus } from "@/types";

const TERMINAL: PaymentStatus[] = [
  PaymentStatus.Success,
  PaymentStatus.Failed,
  PaymentStatus.Timeout,
];

export const useFocusOnPaymentResult = (
  status: PaymentStatus,
  ref: RefObject<HTMLElement | null>,
): void => {
  useEffect(() => {
    if (!TERMINAL.includes(status)) return;
    const node = ref.current;
    if (!node) return;
    const t = window.setTimeout(() => {
      node.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [status, ref]);
};
