"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitted(true);
        if (json.data.devResetUrl) {
          setDevResetUrl(json.data.devResetUrl);
        }
        toast.success(json.data.message);
      } else {
        toast.error(json.error?.message || "Request failed");
      }
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-stone-950 font-bold">
            <Coffee className="h-5 w-5" />
          </div>
        </Link>
        <h2 className="text-xl font-bold text-white">Reset your password</h2>
        <p className="text-xs text-stone-400 mt-1">
          Enter your registered email or mobile to receive a password reset link.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border-stone-800 bg-stone-900/80">
          <CardContent className="pt-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email or Mobile"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-xs text-stone-300">
                  If an active account exists, reset instructions have been dispatched.
                </p>
                {devResetUrl && (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Mock Provider (Dev Mode)
                    </span>
                    <a
                      href={devResetUrl}
                      className="block text-xs text-amber-300 underline break-all mt-1"
                    >
                      {devResetUrl}
                    </a>
                  </div>
                )}
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

