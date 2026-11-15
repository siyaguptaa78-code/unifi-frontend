"use client";

import React, { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

type Otp = { code: string; action: "ENTRY" | "EXIT"; expiresAt: string; cafe: string };

/**
 * Shows the customer their live cafe entry/exit OTP. Staff ask for this code after tapping the
 * card. Polls briefly so the code appears within seconds of the tap.
 */
export function VisitOtpBanner() {
  const [otp, setOtp] = useState<Otp | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/customer/visit-otp");
        if (res.ok && alive) setOtp((await res.json()).data);
      } catch {
        // ignore network blips
      }
    };
    load();
    const poll = setInterval(load, 8000);
    const clock = setInterval(() => tick((n) => n + 1), 1000);
    return () => {
      alive = false;
      clearInterval(poll);
      clearInterval(clock);
    };
  }, []);

  if (!otp) return null;
  const secondsLeft = Math.max(0, Math.floor((new Date(otp.expiresAt).getTime() - Date.now()) / 1000));
  if (secondsLeft === 0) return null;

  return (
    <div className="border-b border-emerald-500/40 bg-emerald-950/70">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-emerald-100">
        <span className="inline-flex items-center gap-2 font-semibold">
          <KeyRound className="h-4 w-4 text-emerald-400" />
          Your {otp.action === "ENTRY" ? "check-in" : "check-out"} code{otp.cafe ? ` at ${otp.cafe}` : ""}:
        </span>
        <span className="font-mono text-xl font-extrabold tracking-[0.35em] text-white">{otp.code}</span>
        <span className="text-xs text-emerald-300">
          Tell this to the staff · expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
