# Payment Gateway Lab (Next.js)

Mid-level take-home: a mocked payment gateway UI built with the Next.js App Router, strict TypeScript, React Hook Form + Zod, Zustand with persistence, and a simulated `POST /api/pay` route handler. No third-party payment SDKs—only `fetch` to the local API.

## Live demo

The app is deployed on Vercel: [https://paymentgateway-seven.vercel.app/](https://paymentgateway-seven.vercel.app/)

## Prerequisites

- **Node.js** 20+ (LTS recommended; matches Next.js 16 expectations)
- **pnpm** (lockfile is `pnpm-lock.yaml`). You can use `npm install` / `npm run dev` if you prefer, but pnpm is what this repo is tested with.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

| Command        | Purpose                          |
| -------------- | -------------------------------- |
| `pnpm dev`     | Development server (Turbopack) |
| `pnpm build`   | Production build                 |
| `pnpm start`   | Run production server            |
| `pnpm lint`    | ESLint                           |

No `.env` file is required: the mock gateway and client both use same-origin `/api/pay`.

## Architecture highlights

- **`app/api/pay/route.ts`** — Server-side random outcomes (~60% approve, ~25% issuer decline with a textual reason, ~15% slow branch sleeping **8s**).
- **`services/payment-api.ts`** — Single `fetch` wrapper with `AbortController` cutoff at **6s** (assignment requirement).
- **`hooks/use-payment-flow.ts`** — Orchestrates the minimum **~2s** processing UI alongside the in-flight request.
- **`stores/payment-store.ts`** — Zustand for lifecycle, attempts, and messages; transaction history persists via **`localStorage`** (only the history slice is persisted).
- **`validation/payment-schema.ts`** — One Zod schema for the checkout form; CVV length rules follow detected card type (Amex **4**, others **3**).
- **`utils/payment-pan.ts`** — PAN formatting, spacing, brand detection from IIN prefixes, Luhn (optional guard), **`maxCvvDigitsForCardType`**.
- **`utils/payment-expiry.ts`** — MM/YY parsing, past-expiry rejection, splitting for payload.
- **`utils/checkout-display.ts`** — Shared display helpers for card preview labels and status-screen phases.

## Assumptions

1. **Demo / sandbox only** — No real card processing. PAN and CVV are accepted in-browser for the simulation and forwarded only to this app’s mock route—not to Stripe, Razorpay, or similar.

2. **Money** — Amounts are typed as decimal strings in the form (e.g. `49.99`), normalized and sent as **`number`** in major units with **USD** or **INR** from a fixed select.

3. **Card networks** — Brand is inferred from the **PAN prefix** (Visa `4`, Mastercard `51–55` / `2221–2720`, Amex `34`/`37`, RuPay subset in code). **`Unknown`** is allowed while the number is incomplete; CVV UX defaults to **3** digits until Amex is detected, then allows **4** and trims excess if the PAN changes away from Amex—aligned with Zod refinement.

4. **Slow lane vs client timeout** — The server may intentionally respond after **~8s**; the client aborts at **6s**, so users can see the timeout path while the handler may still complete later—a deliberate assignment edge case.

5. **Retries and history** — One `crypto.randomUUID()` per payment attempt is reused for all retries; the history list upserts by that id so retries do not duplicate rows.

6. **Validation surface** — Client-side validation is RHF + Zod. The API performs a **light structural** check on JSON; a production system would mirror full card/business rules server-side or use a real gateway.

## What I would improve given more time

- **Automated tests** — Vitest for pure utils (PAN, expiry, schema refinements) and React Testing Library for form states, status transitions, and retry limits; Playwright for success / failure / timeout happy paths.
- **Observability** — Correlation ids, structured logs, and client-side timing marks for “processing min display” vs network duration.
- **BIN data** — Replace prefix heuristics with a versioned BIN range table or third-party service for accurate length/brand (including co-badged cards).
- **Security hardening** — Rate limiting on `/api/pay`, stricter payload validation, optional session binding of `transactionId`, and content security policy tuned for a payments surface.
- **Accessibility** — Formal pass with axe and screen readers, especially live regions for processing/timeout and focus order after status changes.
- **i18n & locale** — Extract copy, format amounts with explicit locale rules, and support more currencies if the product scope grows.

## Tooling notes

- **Zod v3** is pinned (see `package.json` / `pnpm.overrides`) because `@hookform/resolvers` is used on the Zod 3 API surface; upgrading Zod major should wait on resolver compatibility.
