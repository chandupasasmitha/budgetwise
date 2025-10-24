import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentMethods from "@/components/dashboard/settings/payment-methods";
import ExpenseCategories from "@/components/dashboard/settings/expense-categories";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <div className="grid gap-6 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <p>Profile settings are under construction.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Manage your payment methods. These will be available when adding a transaction.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <PaymentMethods />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Expense Categories</CardTitle>
                        <CardDescription>Manage your custom expense categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpenseCategories />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
