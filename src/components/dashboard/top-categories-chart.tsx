'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { mockExpenses } from '@/lib/mock-data';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

const categoryTotals = EXPENSE_CATEGORIES.map(category => {
    const total = mockExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: category, total: total };
});

const topCategories = categoryTotals.sort((a, b) => b.total - a.total).slice(0, 3);

const chartConfig = {
  total: {
    label: "Total Spent",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function TopCategoriesChart() {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="vertical" margin={{ left: 10, right: 10 }}>
                     <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                    <Tooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="total" radius={5} fill="hsl(var(--primary))" />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
