"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { acceptInvitation } from "@/lib/db-books";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

function InvitationContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Validating your invitation...");

  useEffect(() => {
    if (authLoading) return; // Wait for authentication state to be resolved

    const bookId = searchParams.get("bookId");
    const email = searchParams.get("email");

    if (!bookId || !email) {
      setStatus("error");
      setMessage("Invalid invitation link. Please check the URL and try again.");
      return;
    }

    // If user is not logged in, redirect them to sign up
    if (!user) {
      // Store invitation details in session storage to retrieve after signup/login
      sessionStorage.setItem('pendingInvitation', JSON.stringify({ bookId, email }));
      router.push(`/signup?email=${encodeURIComponent(email)}&redirect=/invite`);
      return;
    }

    // If user is logged in, but with the wrong email (case-insensitive check)
    if (user.email?.toLowerCase() !== email.toLowerCase()) {
      setStatus("error");
      setMessage(`This invitation is for ${email}. You are logged in as ${user.email}. Please log out and use the correct account.`);
      return;
    }

    const handleAccept = async () => {
      try {
        const success = await acceptInvitation(bookId, email);
        if (success) {
          setStatus("success");
          setMessage("Invitation accepted! You now have access to the cash book.");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setStatus("error");
          setMessage("Failed to accept invitation. It may have expired or been revoked.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
        console.error(err);
      }
    };

    handleAccept();
  }, [searchParams, router, user, authLoading]);

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Accept Invitation</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we process your invitation.'}
            {status === 'success' && 'Welcome aboard! Redirecting you to your dashboard...'}
            {status === 'error' && 'Something went wrong.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
          {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
          {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
          <p className="text-center text-muted-foreground">{message}</p>
          {status !== 'loading' && (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvitationContent />
        </Suspense>
    )
}
