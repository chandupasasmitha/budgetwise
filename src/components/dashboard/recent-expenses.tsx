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
import ExpensesTable from "./expenses-table";

interface RecentTransactionsProps {
  transactions: Transaction[];
  bookId: string;
  isLoading: boolean;
}

export default function RecentTransactions({ transactions, bookId, isLoading }: RecentTransactionsProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Here are your most recent transactions.
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddTransactionSheet bookId={bookId} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ExpensesTable expenses={expenses} />
        )}
      </CardContent>
    </Card>
  );
}
