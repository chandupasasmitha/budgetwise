"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Expense } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { AddExpenseSheet } from "./add-expense-sheet";
import ExpensesTable from "./expenses-table";
export default function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      const q = query(
        collection(db, "expenses"),
        orderBy("date", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: data.amount,
          category: data.category,
          date: data.date?.toDate ? data.date.toDate() : new Date(),
          description: data.description,
        };
      });
      setExpenses(expensesData);
      setLoading(false);
    }
    fetchExpenses();
  }, []);

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
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ExpensesTable expenses={expenses} />
        )}
      </CardContent>
    </Card>
  );
}
