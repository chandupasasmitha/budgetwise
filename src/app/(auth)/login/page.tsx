
"use client";

import { useEffect, useState } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { storeUser } from '@/lib/db-books';
import { LoginForm } from "@/components/auth/login-form";
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User has successfully signed in.
          const { uid, email, displayName } = result.user;
          await storeUser({ uid, email, displayName });
          toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
          router.push('/dashboard');
          // No need to set isProcessing to false, as we are navigating away
        } else {
          // No redirect result, so we are just viewing the login page normally.
          setIsProcessingRedirect(false);
        }
      } catch (error: any) {
        console.error("Google login redirect error:", error);
        toast({
          variant: 'destructive',
          title: 'Google login failed',
          description: error.message || 'An unexpected error occurred.',
        });
        setIsProcessingRedirect(false);
      }
    }
    
    handleRedirect();
  }, [router, toast]);

  if (isProcessingRedirect) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2 text-lg text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Processing login...</span>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}

