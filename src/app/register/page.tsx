"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Pre-fill the referral code from a shared link like /register?ref=ROHAN4821
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password, confirmPassword, referralCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Registration failed");
      }
      toast.success("Account created successfully!");
      await refreshUser();
      router.push(json.data.redirectUrl || "/customer/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-lg">
            <Coffee className="h-6 w-6 stroke-[2.2]" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Join the Uni<span className="text-amber-500">Cafe</span> Network
        </h2>
        <p className="mt-1 text-xs text-stone-400">
          Sign up to purchase membership, receive 5,000 points & 150 cafe hours.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Card className="border-stone-800 bg-stone-900/80 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-3.5">
              <Input
                label="Full Name"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="aarav@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Mobile Number (10 digits)"
                type="tel"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />

              <Input
                label="Password (min 8 chars, 1 uppercase, 1 number)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Input
                label="Referral Code (optional)"
                placeholder="e.g. ROHAN4821"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              />

              <Button type="submit" className="w-full mt-2 font-semibold" isLoading={isLoading}>
                Create Membership Account
              </Button>
            </form>

            <div className="mt-4 border-t border-stone-800/80 pt-4 text-center text-xs text-stone-400">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-500 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

