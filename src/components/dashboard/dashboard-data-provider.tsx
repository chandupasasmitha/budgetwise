"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Expense } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";

// Context type
interface DashboardDataContextType {
  expenses: Expense[];
  loading: boolean;
}

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);
export function DashboardDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      if (!user) {
        setExpenses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const q = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
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
  }, [user]);

  return (
    <DashboardDataContext.Provider value={{ expenses, loading }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context)
    throw new Error(
      "useDashboardData must be used within DashboardDataProvider"
    );
  return context;
}
