import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockExpenses } from "@/lib/mock-data";
import { AddExpenseSheet } from "./add-expense-sheet";
import ExpensesTable from "./expenses-table";

export default function RecentExpenses() {
  const recentExpenses = [...mockExpenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

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
            <AddExpenseSheet />
        </div>
      </CardHeader>
      <CardContent>
        <ExpensesTable expenses={recentExpenses} />
      </CardContent>
    </Card>
  );
}
