"use client";

import {
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  usePaymentCheckoutState,
  type PaymentCheckoutState,
} from "@/hooks";

const PaymentCheckoutContext =
  createContext<PaymentCheckoutState | null>(null);

export const PaymentCheckoutProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const value = usePaymentCheckoutState();
  return (
    <PaymentCheckoutContext.Provider value={value}>
      {children}
    </PaymentCheckoutContext.Provider>
  );
};

export const usePaymentCheckout = (): PaymentCheckoutState => {
  const ctx = useContext(PaymentCheckoutContext);
  if (!ctx) {
    throw new Error(
      "usePaymentCheckout must be used within PaymentCheckoutProvider"
    );
  }
  return ctx;
};
