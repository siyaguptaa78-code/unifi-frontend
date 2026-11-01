"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { QrCode, CreditCard, ShieldCheck, Clock, MapPin, History } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/components/providers";

export default function CustomerCardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/card");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  const card = data?.card;
  const history = data?.cardHistory || [];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <QrCode className="h-6 w-6 text-amber-500" />
              <span>Digital Membership Card</span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Present this card at the entrance desk of any UniCafe location or tap your physical NFC card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Visual Smart Card */}
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">UniCafe Access</h3>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold block">
                      Universal Pass
                    </span>
                  </div>
                </div>
                <Badge variant={card?.status === "ACTIVE" ? "success" : "destructive"}>
                  {card?.status || "ACTIVE"}
                </Badge>
              </div>

              {/* Simulated QR Code / Barcode Display */}
              <div className="my-8 flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-stone-950 shadow-inner">
                {/* SVG QR Code Simulation */}
                <div className="w-40 h-40 bg-stone-950 p-2 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-6 gap-1.5 w-full h-full p-2 bg-white rounded">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          i % 2 === 0 || i % 7 === 0 ? "bg-stone-950" : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 font-mono text-xs font-extrabold tracking-wider">
                  UID: {card?.uid || "E200-0019-0601"}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-between items-center text-xs relative z-10">
                <div>
                  <div className="text-[10px] text-stone-400">Cardholder</div>
                  <div className="font-bold text-white mt-0.5">{user?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-stone-400">Card Number</div>
                  <div className="font-mono text-stone-300 mt-0.5">{card?.cardNumber}</div>
                </div>
              </div>
            </div>

            {/* Card Information & History */}
            <div className="space-y-6">
              <Card className="border-stone-800 bg-stone-900/60 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Card Specifications</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-800/80">
                    <span className="text-stone-400">Card Technology</span>
                    <span className="font-semibold text-stone-200">{card?.cardType || "NFC (Mifare Ultralight)"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-800/80">
                    <span className="text-stone-400">Assigned Cafe Desk</span>
                    <span className="font-semibold text-stone-200">{card?.assignedCafe?.name || "Central Desk"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-800/80">
                    <span className="text-stone-400">Issued On</span>
                    <span className="font-semibold text-stone-200">{formatDateTime(card?.issuedAt)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-400">Last Scanned</span>
                    <span className="font-semibold text-stone-200">{formatDateTime(card?.lastUsedAt || card?.lastTapAt)}</span>
                  </div>
                </div>
              </Card>

              {/* History / Replacements */}
              <Card className="border-stone-800 bg-stone-900/60 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-500" />
                  <span>Card Lifecycle & Replacements</span>
                </h3>

                <div className="space-y-2">
                  {history.map((c: any) => (
                    <div key={c._id} className="p-3 rounded-lg bg-stone-950/60 border border-stone-800/80 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-mono text-stone-300 font-semibold">{c.uid}</div>
                        <div className="text-[11px] text-stone-500">{c.cardNumber} • {c.cardType}</div>
                      </div>
                      <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

