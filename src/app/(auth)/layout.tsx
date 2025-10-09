import { Logo } from "@/components/icons/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Logo className="h-8 w-8" />
            <span>BudgetWise</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
