"use client";

import React, { useState, useEffect } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Building2, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

export default function FranchisePublicPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/franchise-packages");
        if (res.ok) {
          const json = await res.json();
          setPackages(json.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    toast.success("Franchise application received! Our team will contact you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Franchise Opportunities
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Partner with UniCafe
            </h1>
            <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed">
              Join India&apos;s fastest growing hospitality & workspace ecosystem. Scalable recurring membership revenue, high operational efficiency, and turnkey setup.
            </p>
          </div>

          {/* Investment Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {packages.map((pkg, idx) => (
              <Card key={pkg._id} className="border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                    Tier {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <div className="mt-3 mb-4 text-2xl font-extrabold text-white">
                    {formatINR(pkg.amount)}
                  </div>
                  <div className="text-xs text-stone-400 mb-4 pb-4 border-b border-stone-800">
                    Recommended space: <strong className="text-stone-200">{pkg.cafeSize}</strong>
                  </div>

                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider block">
                      Inclusions
                    </span>
                    {pkg.setupInclusions?.map((inc: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a href="#inquiry">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Inquire for this Tier
                  </Button>
                </a>
              </Card>
            ))}
          </div>

          {/* Inquiry Application Form */}
          <div id="inquiry" className="max-w-2xl mx-auto rounded-3xl border border-stone-800 bg-stone-900/60 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">Apply for a UniCafe Franchise</h3>
              <p className="text-xs text-stone-400 mt-1">
                Fill in your details and our expansion supervisor will get in touch with complete financial prospectus.
              </p>
            </div>

            {!applied ? (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Applicant Name" placeholder="Rajiv Bajaj" required />
                  <Input label="Mobile Number" type="tel" placeholder="9876543210" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Email Address" type="email" placeholder="rajiv@example.com" required />
                  <Input label="Preferred City / Location" placeholder="e.g. Pune, Hyderabad, Jaipur" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Investment Budget
                  </label>
                  <select className="flex h-10 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100">
                    <option value="2500000">₹25,00,000 (UniCafe Express)</option>
                    <option value="5000000">₹50,00,000 (UniCafe Lounge)</option>
                    <option value="7500000">₹75,00,000 (UniCafe Premier Hub)</option>
                    <option value="10000000">₹1,00,00,000 (UniCafe Flagship Experience)</option>
                  </select>
                </div>
                <Button type="submit" className="w-full mt-4 font-semibold">
                  Submit Franchise Application
                </Button>
              </form>
            ) : (
              <div className="p-6 text-center rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-white">Application Successfully Submitted</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Thank you! Our Area Expansion Director will review your application and send the detailed franchise agreement and financial model.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

