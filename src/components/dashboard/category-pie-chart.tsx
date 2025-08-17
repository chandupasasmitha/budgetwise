'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { mockExpenses } from '@/lib/mock-data';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

const categoryData = EXPENSE_CATEGORIES.map(category => {
    const total = mockExpenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: category, value: total };
}).filter(item => item.value > 0);

const chartConfig = {
    value: {
        label: "Amount",
    },
    ...Object.fromEntries(categoryData.map((item, index) => [item.name, { label: item.name, color: `hsl(var(--chart-${(index % 5) + 1}))` }]))
} satisfies ChartConfig;


export default function CategoryPieChart() {
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-square">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                         {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
