import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TopCategoriesChart from "@/components/dashboard/top-categories-chart";
import SpendingComparisonChart from "@/components/dashboard/spending-comparison-chart";
import TransactionsTable from "@/components/dashboard/transactions-table";
import { mockExpenses } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";

export default function ReportsPage() {
    const transactions: Transaction[] = mockExpenses.map(expense => ({
        ...expense,
        type: 'expense'
    }));

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Spending Analytics</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Spending Categories</CardTitle>
                        <CardDescription>Your top 3 spending categories this month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopCategoriesChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly vs. Monthly Spending</CardTitle>
                        <CardDescription>Comparison of your spending patterns.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpendingComparisonChart />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>A complete list of all your transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionsTable transactions={[...transactions].sort((a,b) => b.date.getTime() - a.date.getTime())} />
                </CardContent>
            </Card>
        </div>
    );
}
