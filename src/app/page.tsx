import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Coins,
  Clock,
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Wifi,
  Zap,
  Car,
  Store,
  Users,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col text-white selection:bg-amber-500 selection:text-stone-950">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 border-b border-stone-800/80">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-amber-600/15 via-amber-500/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Multi-Location Cafe Access & Specialty Coffee Membership</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
              Premium Workspace. Artisanal Coffee. <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                One Seamless Membership.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Unifi Cafe reimagines the third space for modern professionals and creators.
              Recharge ₹5,000 to unlock 5,000 points for dining, 150 hours of high-speed cafe access, contactless NFC entry, and online pre-ordering before arrival.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto font-bold px-8 gap-2 shadow-xl shadow-amber-600/25 bg-amber-500 hover:bg-amber-400 text-stone-950">
                  <span>Join Unifi Cafe for ₹5,000</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/customer/menu">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold border-stone-700 hover:bg-stone-900 text-stone-200">
                  <Coffee className="h-4 w-4 mr-2 text-amber-400" />
                  <span>Browse Cafe Menu</span>
                </Button>
              </Link>
              <Link href="/locations">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto text-stone-300 hover:text-white">
                  <span>Explore 5 Hubs</span>
                </Button>
              </Link>
            </div>

            {/* Core Value Proposition Cards */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Coins className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-amber-400">₹5,000</div>
                <div className="text-xs font-semibold text-white mt-1">Recharge = 5,000 Points</div>
                <div className="text-[11px] text-stone-400 mt-0.5">1 Point = ₹1 INR. 100% money converted, points carry forward.</div>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-white">150 Hours</div>
                <div className="text-xs font-semibold text-white mt-1">Workspace Allocation</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Resets to full 150h on every recharge. High-speed WiFi included.</div>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Car className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-amber-400">Pre-Order</div>
                <div className="text-xs font-semibold text-white mt-1">Order Before Arrival</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Pick up freshly prepared food or dine in. No home delivery.</div>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-white">NFC / RFID</div>
                <div className="text-xs font-semibold text-white mt-1">Contactless Smart Card</div>
                <div className="text-[11px] text-stone-400 mt-0.5">Instant tap check-in at all Bangalore, Mumbai & NCR locations.</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 border-b border-stone-800/80 bg-stone-950">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="default" className="mb-3">The Membership Model</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How Unifi Cafe Works For You
              </h2>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">
                A simple, transparent subscription model that gives you 100% of your money back in food, drinks, and coworking freedom.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-7 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 font-extrabold text-lg">
                    01
                  </div>
                  <h3 className="text-xl font-bold text-white">Recharge ₹5,000</h3>
                  <p className="mt-2.5 text-xs text-stone-300 leading-relaxed">
                    Every ₹5,000 payment credits <strong>5,000 points</strong> straight to your wallet. You also receive <strong>150 hours</strong> of cafe access.
                    Unused points never expire—they carry forward across recharges, and hours reset back to 150 hours each cycle.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <Coins className="h-4 w-4" />
                  <span>100% value returned in points</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-7 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 font-extrabold text-lg">
                    02
                  </div>
                  <h3 className="text-xl font-bold text-white">NFC Tap & Check-In</h3>
                  <p className="mt-2.5 text-xs text-stone-300 leading-relaxed">
                    Walk into any Unifi Cafe branch in Indiranagar, Koramangala, Bandra, Connaught Place or Cyber Hub.
                    Simply tap your smart NFC card at the entry turnstile or staff scanner. The system computes exact duration and deducts visit minutes seamlessly.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Zero-hour exit safety protection</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-7 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 font-extrabold text-lg">
                    03
                  </div>
                  <h3 className="text-xl font-bold text-white">Order In-Cafe or Online</h3>
                  <p className="mt-2.5 text-xs text-stone-300 leading-relaxed">
                    Order from our 42+ gourmet menu items. Either order <strong>in-cafe</strong> at your table, or <strong>pre-order online</strong> before arriving so your espresso and sourdough panini are ready the moment you walk in.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-800/80 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <Coffee className="h-4 w-4" />
                  <span>Dine-In & Self-Pickup (No home delivery)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Online Pre-Ordering Feature Spotlight */}
        <section className="py-20 border-b border-stone-800/80 bg-gradient-to-b from-stone-900/40 to-stone-950">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <Badge variant="default" className="bg-purple-950/40 text-purple-300 border-purple-500/30 gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  <span>New Feature: Online Pre-Ordering</span>
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Order Online Before You Arrive. <br />
                  <span className="text-amber-400">Ready Fresh When You Step In.</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Heading to the cafe for a meeting or deep work session? Place your order from home, office, or en route. Select your destination branch, choose your expected arrival slot, and pay with points.
                </p>

                <div className="space-y-3 pt-2 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Select Any Unifi Cafe Branch:</strong> View real-time open status, branch address, and live kitchen queues.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Choose Your Arrival Slot:</strong> Choose between immediate preparation (~15m) or schedule up to 90 minutes ahead.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Cafe Self-Pickup / Dine-In Only:</strong> Unifi Cafe operates exclusively on in-store pickup and dine-in. No delivery fees, no cold food, no third-party delivery couriers.
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <Link href="/customer/menu">
                    <Button size="sm" className="font-bold gap-2">
                      <span>Try Online Pre-Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/locations">
                    <Button variant="outline" size="sm">
                      View Branch Locations
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Interactive Visual Mockup */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                      <Coffee className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Unifi Cafe Indiranagar 100ft</div>
                      <div className="text-[10px] text-emerald-400">Open • Kitchen Ready</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 bg-purple-950/30">
                    Pre-Order Active
                  </Badge>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-white">Signature 18-Hour Cold Brew</div>
                      <div className="text-stone-400 text-[11px]">Qty: 1 • Extra cold foam</div>
                    </div>
                    <span className="font-bold text-amber-400">280 pts</span>
                  </div>

                  <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-white">Bocconcini Pesto Panini</div>
                      <div className="text-stone-400 text-[11px]">Qty: 1 • Sourdough toasted</div>
                    </div>
                    <span className="font-bold text-amber-400">380 pts</span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>Expected Arrival Slot:</span>
                    <span>In 30 Mins (14:45)</span>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Pickup instructions: Identify yourself at counter or tap your card. Food will be served hot.
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center text-xs font-bold">
                  <span>Wallet Points Deduction:</span>
                  <span className="text-amber-400 text-sm">660 Points (₹660)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Location Hubs Section */}
        <section className="py-20 border-b border-stone-800/80 bg-stone-950">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <Badge variant="default" className="mb-2">Nationwide Network</Badge>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  5 Flagship Hubs Across 4 Metros
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-400">
                  Your single membership card works across all locations seamlessly.
                </p>
              </div>
              <Link href="/locations">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <span>View All Locations</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Indiranagar 100ft", city: "Bengaluru", address: "542, 100 Feet Road, HAL 2nd Stage", seats: 65, hours: "07:30 - 23:30" },
                { name: "Koramangala 4th Block", city: "Bengaluru", address: "88, 80 Feet Road, 4th Block", seats: 50, hours: "08:00 - 23:00" },
                { name: "Bandra Kurla Complex (BKC)", city: "Mumbai", address: "Unit G-04, Maker Maxity, BKC", seats: 75, hours: "07:00 - 23:00" },
                { name: "Connaught Place (CP)", city: "New Delhi", address: "Block B, Radial Road 3, Inner Circle", seats: 60, hours: "08:00 - 23:00" },
                { name: "DLF Cyber Hub", city: "Gurgaon", address: "Unit 12B, DLF Cyber Hub, Phase 2", seats: 85, hours: "07:00 - 00:00" },
              ].map((cafe) => (
                <div key={cafe.name} className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">{cafe.city}</span>
                      <Badge variant="success" className="text-[9px]">ACTIVE</Badge>
                    </div>
                    <h3 className="font-bold text-base text-white">{cafe.name}</h3>
                    <p className="text-xs text-stone-400 mt-1 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <span>{cafe.address}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-stone-500" />
                      <span>{cafe.hours}</span>
                    </span>
                    <span className="font-semibold text-stone-300">{cafe.seats} seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Franchise Opportunities Preview */}
        <section className="py-20 border-b border-stone-800/80 bg-gradient-to-b from-stone-900/30 to-stone-950">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-8 sm:p-12 relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge variant="default" className="text-amber-400 border-amber-500/30">
                    Franchise Partner Program
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Partner with Unifi Cafe as a Franchise Owner
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    Own a high-margin, tech-enabled cafe and coworking hub in your city.
                    Benefit from central coffee bean roasting, automated RFID turnstiles, proprietary POS, and our recurring membership subscriber network.
                  </p>
                  <ul className="space-y-2 text-xs text-stone-300 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Unifi Cafe Express (400-600 sq ft) from ₹25 Lakhs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Unifi Cafe Lounge (800-1200 sq ft) from ₹50 Lakhs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Unifi Cafe Premier Hub (1500-2200 sq ft) from ₹75 Lakhs</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/franchise">
                      <Button className="font-bold gap-2">
                        <span>Explore Franchise Packages</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="bg-stone-950/80 rounded-2xl border border-stone-800 p-6 space-y-4">
                  <div className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Franchise Economics</span>
                    <Badge variant="default">Proven Model</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">Avg. Payback Period</div>
                      <div className="text-lg font-bold text-amber-400 mt-0.5">14–18 Months</div>
                    </div>
                    <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">Monthly Operating Margin</div>
                      <div className="text-lg font-bold text-white mt-0.5">28% – 34%</div>
                    </div>
                    <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">Pre-Booked Revenue</div>
                      <div className="text-lg font-bold text-amber-400 mt-0.5">100% Guaranteed</div>
                    </div>
                    <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                      <div className="text-[10px] text-stone-400">Central Roastery Supply</div>
                      <div className="text-lg font-bold text-white mt-0.5">Daily Pan-India</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bottom Section */}
        <section className="py-24 text-center relative overflow-hidden">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Work & Coffee Life?
            </h2>
            <p className="mt-4 text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
              Activate your Unifi Cafe membership in 2 minutes. Get 5,000 points and 150 hours of uninterrupted productivity.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto font-bold px-8 shadow-xl shadow-amber-600/30">
                  Create Customer Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Log in to Demo Accounts
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
