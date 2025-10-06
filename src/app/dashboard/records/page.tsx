
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CategoryPieChart from "@/components/dashboard/category-pie-chart";
import SpendingTrendChart from "@/components/dashboard/spending-trend-chart";
import { getTransactionsForBook } from "@/lib/db-books";
import type { Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function RecordsContent() {
    const searchParams = useSearchParams();
    const bookId = searchParams.get("bookId");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTransactions() {
            if (!bookId) {
                setLoading(false);
                return;
            };
            setLoading(true);
            const transactionsData = await getTransactionsForBook(bookId);
            const processedTransactions = transactionsData.map((t: any) => ({
                ...t,
                date: t.date instanceof Date ? t.date : new Date(t.date),
            }));
            setTransactions(processedTransactions);
            setLoading(false);
        }
        fetchTransactions();
    }, [bookId]);

    const expenses = transactions.filter((t) => t.type === "expense");

    if (loading) {
        return (
             <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-semibold">Spending Records</h1>
                 <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                           <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64 mt-1" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!bookId) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">Please select a book from the dashboard to view records.</p>
            </div>
        )
    }
    
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground">No transactions found for this book.</p>
            </div>
        )
    }


    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Spending Records</h1>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                        <CardDescription>A look at where your money is going.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryPieChart expenses={expenses} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Spending Trend</CardTitle>
                        <CardDescription>Your spending over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SpendingTrendChart expenses={expenses} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function RecordsPage() {
    return (
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <RecordsContent />
        </Suspense>
    )
}
