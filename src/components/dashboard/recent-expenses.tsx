"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Expense } from "@/lib/types";
import AddExpenseSheet from "./add-expense-sheet";
import ExpensesTable from "./expenses-table";

interface RecentExpensesProps {
  expenses: Expense[];
  bookId: string;
  isLoading: boolean;
}

export default function RecentExpenses({ expenses, bookId, isLoading }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Here are your most recent transactions.
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddExpenseSheet bookId={bookId} />
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
