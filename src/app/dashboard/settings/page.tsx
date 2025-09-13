import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentMethods from "@/components/dashboard/settings/payment-methods";

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
            </div>
        </div>
    );
}
