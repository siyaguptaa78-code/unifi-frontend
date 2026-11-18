"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/layout/auth-shell";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    { role: "Super Admin", id: "admin@unificafe.demo", pw: "Admin@123", dot: "bg-purple-400" },
    { role: "Area Supervisor", id: "supervisor@unificafe.demo", pw: "Demo@123", dot: "bg-blue-400" },
    { role: "Franchise Owner", id: "owner@unificafe.demo", pw: "Demo@123", dot: "bg-emerald-400" },
    { role: "Cafe Manager", id: "manager@unificafe.demo", pw: "Demo@123", dot: "bg-amber-400" },
    { role: "Cafe Staff", id: "staff@unificafe.demo", pw: "Demo@123", dot: "bg-cyan-400" },
    { role: "Customer", id: "customer@unificafe.demo", pw: "Demo@123", dot: "bg-stone-300" },
  ];

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Unifi Cafe account. Members, cafe teams and partners all sign in here."
      footer={
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/50 p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Demo accounts — click to fill</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {demoAccounts.map((acc) => {
              const selected = identifier === acc.id;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc.id, acc.pw)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer ${
                    selected ? "border-amber-500/60 bg-amber-500/10" : "border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900"
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${acc.dot}`} />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-stone-100">{acc.role}</span>
                    <span className="block truncate text-[10px] text-stone-500">{acc.id}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          label="Email address or mobile number"
          type="text"
          autoComplete="username"
          placeholder="you@example.com or 9876543210"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="h-11"
          required
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-stone-300">
              Password
            </label>
            <Link href="/reset-password" className="text-xs font-medium text-amber-500 hover:text-amber-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-stone-500 hover:text-stone-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full gap-2 text-sm font-semibold" isLoading={isLoading}>
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-sm text-stone-400">
          New to Unifi Cafe?{" "}
          <Link href="/register" className="font-semibold text-amber-500 hover:text-amber-400 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
