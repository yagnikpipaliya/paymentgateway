import { CLIENT_TIMEOUT_MS, USER_MESSAGES } from "@/constants";
import { PayApiOutcome, type PayApiResponse, type PaymentPayload } from "@/types";

/** Discriminator for `PayClientResult` — use these instead of raw strings at call sites. */
export enum PayClientResultKind {
  Success = "success",
  Failed = "failed",
  Timeout = "timeout",
  Network = "network",
  Http = "http",
  Parse = "parse",
}

export type PayClientResult =
  | { kind: PayClientResultKind.Success; transactionId: string }
  | { kind: PayClientResultKind.Failed; transactionId: string; reason: string }
  | { kind: PayClientResultKind.Timeout }
  | { kind: PayClientResultKind.Network; message: string }
  | { kind: PayClientResultKind.Http; message: string }
  | { kind: PayClientResultKind.Parse; message: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export async function payWithAbort(
  payload: PaymentPayload,
  options: { signal: AbortSignal }
): Promise<PayClientResult> {
  let response: Response;
  try {
    response = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: options.signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { kind: PayClientResultKind.Timeout };
    }
    return { kind: PayClientResultKind.Network, message: USER_MESSAGES.network };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return {
      kind: PayClientResultKind.Parse,
      message: USER_MESSAGES.parseError,
    };
  }

  if (!response.ok) {
    const rec = asRecord(json);
    const msg =
      typeof rec?.error === "string" ? rec.error : USER_MESSAGES.genericHttp;
    return { kind: PayClientResultKind.Http, message: msg };
  }

  const parsed = json as PayApiResponse;
  if (
    parsed &&
    typeof parsed === "object" &&
    "ok" in parsed &&
    parsed.ok === true &&
    parsed.outcome === PayApiOutcome.Success
  ) {
    return {
      kind: PayClientResultKind.Success,
      transactionId: parsed.transactionId,
    };
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "ok" in parsed &&
    parsed.ok === false &&
    parsed.outcome === PayApiOutcome.Failed &&
    typeof parsed.reason === "string"
  ) {
    return {
      kind: PayClientResultKind.Failed,
      transactionId: parsed.transactionId,
      reason: parsed.reason,
    };
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "ok" in parsed &&
    parsed.ok === false &&
    parsed.outcome === PayApiOutcome.Slow
  ) {
    return { kind: PayClientResultKind.Timeout };
  }

  return { kind: PayClientResultKind.Parse, message: USER_MESSAGES.parseError };
}

export function createPaymentAbortHandle(): {
  controller: AbortController;
  cancelTimer: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, CLIENT_TIMEOUT_MS);
  const cancelTimer = (): void => {
    clearTimeout(timer);
  };
  return { controller, cancelTimer };
}
