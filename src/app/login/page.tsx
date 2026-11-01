"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coffee, ShieldCheck, ArrowRight, UserCheck, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter email/mobile and password");
      return;
    }
    setIsLoading(true);
    try {
      const res = await login(identifier, password);
      router.push(res.redirectUrl);
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (id: string, pw: string) => {
    setIdentifier(id);
    setPassword(pw);
  };

  const demoAccounts = [
    { role: "Super Admin", id: "admin@unicafe.demo", pw: "Admin@123", color: "border-purple-500/40 text-purple-400" },
    { role: "Area Supervisor", id: "supervisor@unicafe.demo", pw: "Demo@123", color: "border-blue-500/40 text-blue-400" },
    { role: "Franchise Owner", id: "owner@unicafe.demo", pw: "Demo@123", color: "border-emerald-500/40 text-emerald-400" },
    { role: "Cafe Manager", id: "manager@unicafe.demo", pw: "Demo@123", color: "border-amber-500/40 text-amber-400" },
    { role: "Cafe Staff", id: "staff@unicafe.demo", pw: "Demo@123", color: "border-cyan-500/40 text-cyan-400" },
    { role: "Customer", id: "customer@unicafe.demo", pw: "Demo@123", color: "border-stone-500/40 text-stone-300" },
  ];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-lg">
            <Coffee className="h-6 w-6 stroke-[2.2]" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Sign in to Uni<span className="text-amber-500">Cafe</span>
        </h2>
        <p className="mt-1 text-xs text-stone-400">
          Enter your registered email or mobile to access your workspace portal.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <Card className="border-stone-800 bg-stone-900/80 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email address or Mobile number"
                type="text"
                placeholder="you@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone-300">Password</span>
                  <Link href="/reset-password" className="text-xs text-amber-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full font-semibold" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-stone-400">
              Don&apos;t have a membership account yet?{" "}
              <Link href="/register" className="text-amber-500 font-semibold hover:underline">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 1-Click Demo Accounts Selector */}
        <div className="mt-6 rounded-xl border border-stone-800/80 bg-stone-900/60 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>1-Click Seeded Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc.id, acc.pw)}
                className={`flex flex-col text-left p-2 rounded-lg border bg-stone-950/70 hover:bg-stone-800/60 transition-all cursor-pointer ${acc.color}`}
              >
                <span className="text-xs font-bold text-stone-200">{acc.role}</span>
                <span className="text-[10px] text-stone-400 truncate">{acc.id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

