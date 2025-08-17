import OverviewCards from "@/components/dashboard/overview-cards";
import CategoryPieChart from "@/components/dashboard/category-pie-chart";
import SpendingTrendChart from "@/components/dashboard/spending-trend-chart";
import RecentExpenses from "@/components/dashboard/recent-expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="mt-4 grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <Card className="sm:col-span-2">
                    <CardHeader>
                        <CardTitle>Spending Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SpendingTrendChart />
                    </CardContent>
                </Card>
                <Card className="sm:col-span-2">
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryPieChart />
                    </CardContent>
                </Card>
            </div>
            <RecentExpenses />
        </div>
        <div className="hidden xl:block">
            {/* Can be used for other content later */}
        </div>
      </div>
    </div>
  );
}
