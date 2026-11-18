import React from "react";
import Link from "next/link";
import { Coffee, ShieldCheck } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-stone-800/80 bg-stone-950 text-stone-400 text-xs">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-stone-950 font-bold">
                <Coffee className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
                Unifi <span className="text-amber-500">Cafe</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              India&apos;s premier multi-location workspace cafe network. One membership, unlimited cafe access, artisanal brews and gourmet fare.
            </p>
            <div className="flex items-center gap-1.5 text-amber-500/90 text-[11px] font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>NFC / RFID Secured Entry</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">Membership</h4>
            <ul className="space-y-2">
              <li><Link href="/membership" className="hover:text-amber-400 transition-colors">₹5,000 Recharge Plan</Link></li>
              <li><Link href="/membership#benefits" className="hover:text-amber-400 transition-colors">150 Hours Cafe Time</Link></li>
              <li><Link href="/membership#points" className="hover:text-amber-400 transition-colors">5,000 Reward Points</Link></li>
              <li><Link href="/locations" className="hover:text-amber-400 transition-colors">Access All Locations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">Franchise & Partners</h4>
            <ul className="space-y-2">
              <li><Link href="/franchise" className="hover:text-amber-400 transition-colors">Franchise Opportunities</Link></li>
              <li><Link href="/franchise#packages" className="hover:text-amber-400 transition-colors">Investment Packages</Link></li>
              <li><Link href="/franchise#roi" className="hover:text-amber-400 transition-colors">Financial Model</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Partner Inquiry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider mb-3">Locations</h4>
            <ul className="space-y-2">
              <li><Link href="/locations" className="hover:text-amber-400 transition-colors">Indiranagar, Bengaluru</Link></li>
              <li><Link href="/locations" className="hover:text-amber-400 transition-colors">Koramangala, Bengaluru</Link></li>
              <li><Link href="/locations" className="hover:text-amber-400 transition-colors">BKC, Mumbai</Link></li>
              <li><Link href="/locations" className="hover:text-amber-400 transition-colors">Connaught Place, New Delhi</Link></li>
              <li><Link href="/locations" className="hover:text-amber-400 transition-colors">Cyber Hub, Gurugram</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} Unifi Cafe Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-stone-300">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-stone-300">Privacy Policy</Link>
            <Link href="/refunds" className="hover:text-stone-300">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

