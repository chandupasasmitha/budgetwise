"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, PiggyBank, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Expense } from "@/lib/types";

interface OverviewCardsProps {
  expenses: Expense[];
}

export default function OverviewCards({ expenses }: OverviewCardsProps) {
  const { user } = useAuth();
  const [monthlyBudget, setMonthlyBudget] = useState<number>(2000);
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    async function fetchBudget() {
      if (!user) return;
      setLoadingBudget(true);
      const budgetRef = doc(db, "budgets", user.uid);
      const budgetSnap = await getDoc(budgetRef);
      if (budgetSnap.exists()) {
        setMonthlyBudget(budgetSnap.data().monthlyBudget);
      }
      setLoadingBudget(false);
    }
    fetchBudget();
  }, [user]);

  const handleBudgetChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const budgetRef = doc(db, "budgets", user.uid);
    await setDoc(budgetRef, { monthlyBudget });
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyExpenses = expenses.filter((exp) => {
    const date = exp.date;
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  });
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spent (Month)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleBudgetChange}
            className="flex items-center gap-2"
          >
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              disabled={loadingBudget}
              min={0}
            />
            <button
              type="submit"
              className="bg-primary text-white px-2 py-1 rounded"
            >
              Save
            </button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Remaining Budget
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${remainingBudget.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyExpenses.length}</div>
        </CardContent>
      </Card>
    </>
  );
}
