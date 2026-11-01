import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Coins, Clock, CreditCard, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";

export default function MembershipPublicPage() {
  const faqs = [
    {
      q: "What happens when I recharge ₹5,000?",
      a: "Upon successful payment, ₹5,000 is converted to 5,000 reward points (1 point = ₹1), and your membership hours reset to 150 hours.",
    },
    {
      q: "Do unused points carry forward?",
      a: "Yes! Points carry forward indefinitely upon every recharge. For example, if you have 4,000 points remaining and recharge ₹5,000, your new balance will be 9,000 points.",
    },
    {
      q: "What happens when my 150 membership hours run out?",
      a: "If your hours exhaust while you are currently inside a cafe, you are ALWAYS allowed to check out safely. However, you cannot enter any cafe again until your membership is recharged.",
    },
    {
      q: "Can I use points to order food and coffee?",
      a: "Yes! Every single menu item across all UniCafe locations can be ordered with points. 1 point is exactly equal to ₹1.",
    },
    {
      q: "Can I visit multiple locations in one day?",
      a: "Yes, you can visit any registered UniCafe location across the country. You only need to tap out from one location before tapping in at another.",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Transparent Membership Architecture
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              One Plan. Complete Freedom.
            </h1>
            <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed">
              Designed specifically for founders, engineers, creators, and freelancers who demand premium coffee, high-speed connectivity, and frictionless access.
            </p>
          </div>

          {/* Pricing Highlight Card */}
          <div className="max-w-xl mx-auto mb-20">
            <div className="rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-stone-900 via-stone-900/90 to-stone-950 p-8 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-500">UniCafe Access Pass</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Universal Recharge</h3>
                </div>
                <Badge variant="success">BEST VALUE</Badge>
              </div>

              <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-stone-800">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">₹5,000</span>
                <span className="text-xs text-stone-400">/ recharge cycle</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-1 text-amber-500 mt-0.5">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">5,000 Points Credited</h4>
                    <p className="text-xs text-stone-400">100% of your payment is credited as spendable points (1 point = ₹1).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-1 text-amber-500 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">150 Workspace Hours</h4>
                    <p className="text-xs text-stone-400">High-speed Wi-Fi, ergonomic seating and power plugs at all locations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-1 text-amber-500 mt-0.5">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Smart NFC / RFID Membership Card</h4>
                    <p className="text-xs text-stone-400">Tap-and-enter access at every participating cafe location in India.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-500/10 p-1 text-amber-500 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Points Carry Forward</h4>
                    <p className="text-xs text-stone-400">Unused points never expire and roll over on your next recharge.</p>
                  </div>
                </div>
              </div>

              <Link href="/register" className="block">
                <Button size="lg" className="w-full font-bold shadow-lg shadow-amber-600/30">
                  Activate Membership Now
                </Button>
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white text-center mb-8 flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5 text-amber-500" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="border-stone-800 bg-stone-900/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm text-stone-200">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-stone-400 leading-relaxed">
                    {faq.a}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

