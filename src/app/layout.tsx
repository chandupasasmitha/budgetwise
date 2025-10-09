import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-provider";
import KeyboardListenerClient from "../components/ui/keyboard-listener-client";

export const metadata: Metadata = {
  title: "BudgetWise",
  description: "Smart Personal Finance & Expense Tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  // enable viewport-fit for safe-area insets on iOS/Android
  viewportFit: "cover" as any,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <AuthProvider>
          <KeyboardListenerClient />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
