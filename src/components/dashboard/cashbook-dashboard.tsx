"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getCashBookEntries,
  addCashBookEntry,
  updateCashBookEntry,
  deleteCashBookEntry,
} from "@/lib/cashbook-db";
import type { CashBookEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import CashBookList from "@/components/dashboard/cashbook-list";

export default function CashBookDashboard({
  cashBookId,
}: {
  cashBookId: string;
}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{
    type: "income" | "expense";
    amount: number;
    description: string;
    date: Date;
  }>({
    type: "income",
    amount: 0,
    description: "",
    date: new Date(),
  });

  useEffect(() => {
    async function fetchEntries() {
      if (!user) return;
      setLoading(true);
      const data = await getCashBookEntries(user.uid, cashBookId);
      setEntries(data);
      setLoading(false);
    }
    fetchEntries();
  }, [user, cashBookId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addCashBookEntry(user.uid, cashBookId, {
      ...form,
      userId: user.uid,
      cashBookId,
    });
    setForm({ type: "income", amount: 0, description: "", date: new Date() });
    const data = await getCashBookEntries(user.uid, cashBookId);
    setEntries(data);
  };

  // Dashboard calculations
  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Import chart components
  // ...existing code...
  const CategoryPieChart =
    require("@/components/dashboard/category-pie-chart").default;
  const SpendingTrendChart =
    require("@/components/dashboard/spending-trend-chart").default;
  const SpendingComparisonChart =
    require("@/components/dashboard/spending-comparison-chart").default;
  const TopCategoriesChart =
    require("@/components/dashboard/top-categories-chart").default;

  return (
    <>
      {/* CashBookList for creating cash books */}
      <div className="mb-8">
        <CashBookList />
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <div className="font-bold">Total Income</div>
            <div className="text-2xl">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="font-bold">Total Expenses</div>
            <div className="text-2xl">${totalExpense.toFixed(2)}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="font-bold">Balance</div>
            <div className="text-2xl">${balance.toFixed(2)}</div>
          </div>
        </div>
        {/* Charts for this cash book */}
        <div className="grid grid-cols-2 gap-6">
          <SpendingTrendChart entries={entries} />
          <CategoryPieChart entries={entries} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <SpendingComparisonChart entries={entries} />
          <TopCategoriesChart entries={entries} />
        </div>
        <form onSubmit={handleAdd} className="flex gap-2 items-center">
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value === "income" ? "income" : "expense",
              }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: Number(e.target.value) }))
            }
            className="border rounded px-2 py-1 w-24"
            placeholder="Amount"
            required
          />
          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="border rounded px-2 py-1"
            placeholder="Description"
            required
          />
          <input
            type="date"
            value={form.date.toISOString().slice(0, 10)}
            onChange={(e) =>
              setForm((f) => ({ ...f, date: new Date(e.target.value) }))
            }
            className="border rounded px-2 py-1"
            required
          />
          <Button type="submit">Add Entry</Button>
        </form>
        <div>
          <h2 className="font-bold mb-2">Recent Entries</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul className="space-y-2">
              {entries.slice(0, 10).map((entry) => (
                <li
                  key={entry.id}
                  className="border rounded p-2 flex justify-between items-center"
                >
                  <span>
                    {entry.type === "income" ? "+" : "-"}$
                    {entry.amount.toFixed(2)} - {entry.description} (
                    {entry.date.toLocaleDateString()})
                  </span>
                  {/* Edit/Delete buttons can be added here */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
