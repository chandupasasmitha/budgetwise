"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format, subDays, eachDayOfInterval } from "date-fns";
import type { Expense } from "@/lib/types";

interface SpendingTrendChartProps {
  expenses: Expense[];
}

export default function SpendingTrendChart({ expenses }: SpendingTrendChartProps) {
  const endDate = new Date();
  const startDate = subDays(endDate, 29);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const dailyData = dateRange.map((date) => {
    const formattedDate = format(date, "MMM d");
    const total = expenses
      .filter(
        (exp) => format(exp.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      )
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { date: formattedDate, amount: total };
  });

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={dailyData}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value, index) => (index % 7 === 0 ? value : "")}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="amount"
            type="monotone"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
