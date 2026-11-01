import React from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Badge } from "@/components/ui/badge";
import { Coffee, ShieldCheck, Heart, Sparkles, Target, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="default" className="mb-3">
              Our Vision & Craft
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Reimagining the Workspace Cafe Experience
            </h1>
            <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed">
              UniCafe was founded with a clear thesis: the best ideas happen over great coffee, and modern professionals deserve workspaces that nourish creativity rather than stifling it in sterile cubicles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 space-y-3">
              <div className="rounded-xl bg-amber-500/10 p-3 w-fit text-amber-500">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Artisanal Craft Coffee</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Direct-trade specialty beans sourced from Chikmagalur and Araku Valley, roasted in small batches to perfection.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 space-y-3">
              <div className="rounded-xl bg-amber-500/10 p-3 w-fit text-amber-500">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Productivity Infrastructure</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Gigabit dedicated fiber mesh, ergonomic seating, sound-dampened acoustic zones, and ample universal power stations.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 space-y-3">
              <div className="rounded-xl bg-amber-500/10 p-3 w-fit text-amber-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">NFC Smart Access</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Frictionless RFID and NFC card access across all locations, central points wallets, and zero-loss carry forward.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

