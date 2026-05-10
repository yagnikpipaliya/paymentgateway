"use client";

import { useCallback, useState } from "react";

import type { Transaction } from "@/types";

/** Local modal state for transaction history detail — UI concern, isolated hook. */
export const useTransactionDetailDialog = (): {
  open: boolean;
  active: Transaction | null;
  openWith: (tx: Transaction) => void;
  onDialogOpenChange: (nextOpen: boolean) => void;
} => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Transaction | null>(null);

  const openWith = useCallback((tx: Transaction) => {
    setActive(tx);
    setOpen(true);
  }, []);

  const onDialogOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setActive(null);
    }
  }, []);

  return {
    open,
    active,
    openWith,
    onDialogOpenChange,
  };
};
