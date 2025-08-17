'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { mockExpenses } from '@/lib/mock-data';
import { subWeeks, isWithinInterval } from 'date-fns';

const now = new Date();
const lastWeekStart = subWeeks(now, 1);
const lastMonthStart = subWeeks(now, 4);

const weeklySpending = mockExpenses
  .filter(exp => isWithinInterval(exp.date, { start: lastWeekStart, end: now }))
  .reduce((sum, exp) => sum + exp.amount, 0);

const monthlySpending = mockExpenses
  .filter(exp => isWithinInterval(exp.date, { start: lastMonthStart, end: now }))
  .reduce((sum, exp) => sum + exp.amount, 0);

const comparisonData = [
  { name: 'Last 7 Days', total: weeklySpending },
  { name: 'Last 30 Days', total: monthlySpending },
];

const chartConfig = {
  total: {
    label: 'Total Spent',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function SpendingComparisonChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={comparisonData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} tickMargin={10} />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="total" radius={8} fill="hsl(var(--accent))" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
