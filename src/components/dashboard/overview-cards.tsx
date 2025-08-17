import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, PiggyBank, CreditCard } from "lucide-react";
import { mockExpenses } from "@/lib/mock-data";

export default function OverviewCards() {
  const totalSpent = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = 2000;
  const remainingBudget = monthlyBudget - totalSpent;

  const cards = [
    { title: "Total Spent (Month)", value: `$${totalSpent.toFixed(2)}`, icon: DollarSign },
    { title: "Monthly Budget", value: `$${monthlyBudget.toFixed(2)}`, icon: PiggyBank },
    { title: "Remaining Budget", value: `$${remainingBudget.toFixed(2)}`, icon: Wallet },
    { title: "Transactions", value: mockExpenses.length, icon: CreditCard },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
