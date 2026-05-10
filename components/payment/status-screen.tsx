"use client";

import type { ReactElement, RefObject } from "react";
import { AlertCircleIcon, CheckCircle2Icon, TimerOffIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle, Button } from "@/components/ui";
import { MAX_PAYMENT_ATTEMPTS, USER_MESSAGES } from "@/constants";
import { cn } from "@/lib/utils";
import { PaymentStatus } from "@/types";
import {
  resolveStatusScreenPhase,
  StatusScreenPhaseKind,
} from "@/utils";

const StatusRetryActions = (props: {
  canRetry: boolean;
  onRetry: () => void;
  onNewPayment: () => void;
}): ReactElement => {
  const { canRetry, onRetry, onNewPayment } = props;

  return (
    <div className="flex flex-wrap gap-2">
      {canRetry ? (
        <Button type="button" onClick={onRetry}>
          Retry payment
        </Button>
      ) : null}
      <Button type="button" variant="outline" onClick={onNewPayment}>
        Start new payment
      </Button>
    </div>
  );
};

export interface StatusScreenProps {
  status: PaymentStatus;
  attemptNumber: number;
  failureReason: string | null;
  onDismissSuccess: () => void;
  onRetry: () => void;
  onNewPayment: () => void;
  regionRef: RefObject<HTMLDivElement | null>;
}

export const StatusScreen = (
  props: StatusScreenProps,
): ReactElement | null => {
  const {
    status,
    attemptNumber,
    failureReason,
    onDismissSuccess,
    onRetry,
    onNewPayment,
    regionRef,
  } = props;

  const phase = resolveStatusScreenPhase(status, attemptNumber);

  if (phase.kind === StatusScreenPhaseKind.Idle) {
    return null;
  }

  return (
    <div
      ref={regionRef}
      tabIndex={-1}
      className="outline-none"
      aria-live="polite"
    >
      {phase.kind === StatusScreenPhaseKind.Success ? (
        <Alert className="border-emerald-500/40 bg-emerald-500/10">
          <CheckCircle2Icon className="text-emerald-600" />
          <AlertTitle className="font-display text-emerald-950 dark:text-emerald-50">
            Payment successful
          </AlertTitle>
          <AlertDescription className="space-y-3 font-sans text-emerald-900/90 dark:text-emerald-100/90">
            <p>
              Your payment cleared the simulated gateway. A receipt entry was
              added to transaction history for this idempotent transaction id.
            </p>
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={onDismissSuccess}
            >
              Pay another invoice
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {phase.kind === StatusScreenPhaseKind.Failed ? (
        <Alert variant="destructive" className={cn("border-destructive/50")}>
          <AlertCircleIcon />
          <AlertTitle className="font-display">Payment declined</AlertTitle>
          <AlertDescription className="space-y-3 font-sans">
            <p>
              {failureReason ?? "The issuer could not authorize this charge."}
            </p>
            {!phase.retriesExhausted ? (
              <p className="text-sm text-muted-foreground">
                Attempt {attemptNumber} of {MAX_PAYMENT_ATTEMPTS}. You can retry
                without retyping your card.
              </p>
            ) : (
              <p className="text-sm font-medium">
                {USER_MESSAGES.terminalFailure}
              </p>
            )}
            <StatusRetryActions
              canRetry={phase.canRetry}
              onRetry={onRetry}
              onNewPayment={onNewPayment}
            />
          </AlertDescription>
        </Alert>
      ) : null}

      {phase.kind === StatusScreenPhaseKind.Timeout ? (
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <TimerOffIcon className="text-amber-700" />
          <AlertTitle className="font-display text-amber-950 dark:text-amber-50">
            Gateway timeout
          </AlertTitle>
          <AlertDescription className="space-y-3 font-sans text-amber-950/90 dark:text-amber-50/90">
            <p>{failureReason ?? USER_MESSAGES.timeout}</p>
            {!phase.retriesExhausted ? (
              <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
                Attempt {attemptNumber} of {MAX_PAYMENT_ATTEMPTS}. Retry keeps
                the same transaction id for consistent history.
              </p>
            ) : (
              <p className="text-sm font-medium">
                {USER_MESSAGES.terminalFailure}
              </p>
            )}
            <StatusRetryActions
              canRetry={phase.canRetry}
              onRetry={onRetry}
              onNewPayment={onNewPayment}
            />
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
