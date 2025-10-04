
"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense } from "@/lib/types";

interface CategoryPieChartProps {
  expenses: Expense[];
}

function getCategoryData(expenses: any[]) {
  return EXPENSE_CATEGORIES.map((category) => {
    const total = expenses
      .filter((exp) => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: category, value: total };
  }).filter((item) => item.value > 0);
}

export default function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  const categoryData = getCategoryData(expenses);
  const chartConfig: ChartConfig &
    Record<string, { label: string; color: string }> = {
    value: {
      label: "Amount",
      color: "#8884d8",
    },
    ...Object.fromEntries(
      categoryData.map((item: { name: string }, index: number) => [
        item.name,
        { label: item.name, color: `hsl(var(--chart-${(index % 5) + 1}))` },
      ])
    ),
  };

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full aspect-square"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            strokeWidth={5}
          >
            {categoryData.map((entry: { name: string }, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={chartConfig[entry.name]?.color ?? "#8884d8"}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
