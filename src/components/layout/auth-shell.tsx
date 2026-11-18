import React from "react";
import Link from "next/link";
import { Coffee, Coins, Clock, ScanLine, ShieldCheck } from "lucide-react";

const POINTS = [
  { icon: Coins, title: "Points for food & drinks", text: "Recharge once, spend at any branch. 1 point = ₹1." },
  { icon: Clock, title: "Hours of workspace access", text: "Fast Wi-Fi, quiet seating and power at every table." },
  { icon: ScanLine, title: "Tap-in with your card", text: "NFC check-in and OTP-secured entry and exit." },
];

/**
 * Split-screen layout for sign-in / sign-up: brand story on the left (desktop),
 * the form on the right. Purely presentational.
 */
export function AuthShell({ title, subtitle, children, footer }: { title: React.ReactNode; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-stone-800/80 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/40 lg:flex lg:flex-col lg:justify-between p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-amber-700/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white whitespace-nowrap">
              Unifi <span className="text-amber-500">Cafe</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Work &amp; Coffee Club</div>
          </div>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            One membership.
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Every cafe in the network.</span>
          </h2>
          <ul className="mt-8 space-y-5">
            {POINTS.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{t}</span>
                  <span className="block text-sm text-stone-400">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative grid max-w-md grid-cols-3 gap-3">
          {[
            ["5", "Cafe branches"],
            ["4", "Metro cities"],
            ["1", "Card for all"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 backdrop-blur">
              <div className="text-2xl font-extrabold text-white">{n}</div>
              <div className="mt-0.5 text-xs text-stone-400">{l}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-amber-600/10 blur-[120px] lg:hidden" />
        <div className="relative mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-lg">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-white whitespace-nowrap">
              Unifi <span className="text-amber-500">Cafe</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-stone-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8">{footer}</div>}
          <p className="mt-10 flex items-center gap-1.5 text-[11px] text-stone-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured with encrypted sessions. We never share your details.
          </p>
        </div>
      </main>
    </div>
  );
}
