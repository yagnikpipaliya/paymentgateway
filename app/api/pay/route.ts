import { SERVER_SLOW_RESPONSE_MS } from "@/constants";
import {
  CurrencyCode,
  PayApiOutcome,
  type PayApiResponse,
  type PaymentPayload,
} from "@/types";

export const dynamic = "force-dynamic";

const FAILURE_REASONS = [
  "Insufficient funds",
  "Card issuer declined the transaction",
  "Suspected fraud — verify with your bank",
  "Daily spending limit exceeded",
] as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function validatePayload(body: unknown): PaymentPayload | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const transactionId = o.transactionId;
  const cardholderName = o.cardholderName;
  const cardNumber = o.cardNumber;
  const expiryMonth = o.expiryMonth;
  const expiryYear = o.expiryYear;
  const cvv = o.cvv;
  const amount = o.amount;
  const currency = o.currency;

  if (typeof transactionId !== "string" || transactionId.length === 0)
    return null;
  if (typeof cardholderName !== "string") return null;
  if (typeof cardNumber !== "string") return null;
  if (typeof expiryMonth !== "string") return null;
  if (typeof expiryYear !== "string") return null;
  if (typeof cvv !== "string") return null;
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  if (currency !== CurrencyCode.INR && currency !== CurrencyCode.USD)
    return null;

  return {
    transactionId,
    cardholderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    amount,
    currency,
  };
}

export async function POST(request: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = validatePayload(json);
  if (!payload) {
    return Response.json({ error: "Invalid payment payload." }, { status: 400 });
  }

  const roll = Math.random();

  if (roll < 0.6) {
    const body: PayApiResponse = {
      ok: true,
      transactionId: payload.transactionId,
      outcome: PayApiOutcome.Success,
    };
    return Response.json(body);
  }

  if (roll < 0.85) {
    const reason =
      FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
    const body: PayApiResponse = {
      ok: false,
      transactionId: payload.transactionId,
      outcome: PayApiOutcome.Failed,
      reason,
    };
    return Response.json(body);
  }

  await delay(SERVER_SLOW_RESPONSE_MS);

  const body: PayApiResponse = {
    ok: false,
    transactionId: payload.transactionId,
    outcome: PayApiOutcome.Slow,
    message:
      "Gateway responded slowly (simulated). Clients abort earlier than this.",
  };
  return Response.json(body);
}
