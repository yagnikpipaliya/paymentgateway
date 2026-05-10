"use client";

import type { ReactElement } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useTransactionDetailDialog } from "@/hooks";
import { formatMoney } from "@/stores";
import type { Transaction } from "@/types";
import { formatTransactionTimestamp } from "@/utils";

export interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = (
  props: TransactionHistoryProps,
): ReactElement => {
  const { transactions } = props;
  const { open, active, openWith, onDialogOpenChange } =
    useTransactionDetailDialog();

  return (
    <>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-lg">Transaction history</CardTitle>
          <CardDescription className="font-sans">
            Persisted locally for this demo (survives refresh).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground">
              Completed payments will appear here with idempotent ids.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Transaction ID</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Timestamp</TableHead>
                    <TableHead scope="col" className="text-right">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="max-w-56 truncate font-mono text-xs">
                        {tx.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatMoney(tx.amount, tx.currency)}
                      </TableCell>
                      <TableCell className="capitalize">{tx.status}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatTransactionTimestamp(tx.timestamp)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openWith(tx)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={onDialogOpenChange}>
        <DialogContent>
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Transaction detail</DialogTitle>
                <DialogDescription className="font-sans">
                  Immutable snapshot for id {active.id}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Transaction ID</dt>
                  <dd className="font-mono text-xs break-all">{active.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd>{formatMoney(active.amount, active.currency)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="capitalize">{active.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Timestamp</dt>
                  <dd>{formatTransactionTimestamp(active.timestamp)}</dd>
                </div>
                {active.failureReason ? (
                  <div>
                    <dt className="text-muted-foreground">Detail</dt>
                    <dd>{active.failureReason}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};
