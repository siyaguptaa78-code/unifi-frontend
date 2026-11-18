"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/layout/auth-shell";
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
    <AuthShell
      title="Create your account"
      subtitle="Join Unifi Cafe in a minute. Pick a recharge plan after signing up to start using your card."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <Input label="Full name" autoComplete="name" placeholder="Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} className="h-11" required />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="aarav@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
          />
          <Input
            label="Mobile number"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="h-11"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11"
            required
          />
        </div>
        <p className="-mt-1 text-[11px] text-stone-500">Use at least 8 characters with one uppercase letter and one number.</p>

        <Input
          label="Referral code (optional)"
          placeholder="e.g. ROHAN4821"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          className="h-11 font-mono tracking-wider"
        />

        <Button type="submit" className="h-11 w-full gap-2 text-sm font-semibold" isLoading={isLoading}>
          Create account <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-sm text-stone-400">
          Already a member?{" "}
          <Link href="/login" className="font-semibold text-amber-500 hover:text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
