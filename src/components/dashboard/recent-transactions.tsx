"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import AddTransactionSheet from "./add-transaction-sheet";
import TransactionsTable from "./transactions-table";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentTransactionsProps {
  transactions: Transaction[];
  bookId: string;
  isLoading: boolean;
  onTransactionAdded?: () => void;
  canAddTransaction?: boolean;
}

export default function RecentTransactions({ transactions, bookId, isLoading, onTransactionAdded, canAddTransaction }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Here are your most recent transactions.
          </CardDescription>
        </div>
        {(canAddTransaction === undefined || canAddTransaction === true) && (
            <AddTransactionSheet bookId={bookId} onTransactionAdded={onTransactionAdded} />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <TransactionsTable transactions={transactions} onTransactionChange={onTransactionAdded} />
        )}
      </CardContent>
    </Card>
  );
}
