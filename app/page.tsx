"use client";

import type { ReactElement } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { PaymentForm, TransactionHistory } from "@/components/payment";
import { usePaymentStore } from "@/stores";

const Home = (): ReactElement => {
  const transactions = usePaymentStore((s) => s.transactions);

  return (
    <div className="min-h-screen bg-checkout-shell">
      <a href="#checkout-main" className="skip-link">
        Skip to checkout
      </a>
      <main
        id="checkout-main"
        className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-12 lg:gap-16 lg:px-10 lg:py-16"
      >
        <header className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Secure checkout · simulated gateway
            </p>
            <ModeToggle />
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Payment Gateway Lab
            </h1>
            <p className="font-display max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              Card data stays in-browser for this assignment — only structured
              payloads hit the mocked `/api/pay` route. Expect randomized
              issuer outcomes, enforced client timeouts, and idempotent retries.
            </p>
          </div>
        </header>

        <PaymentForm />

        <TransactionHistory transactions={transactions} />
      </main>
    </div>
  );
};

export default Home;
