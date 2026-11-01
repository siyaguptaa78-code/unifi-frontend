"use client";

import React, { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Phone, Mail, Wifi, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function LocationsPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cafes");
        if (res.ok) {
          const json = await res.json();
          setCafes(json.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Nationwide Presence
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Our Registered Cafe Locations
            </h1>
            <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed">
              Every location is equipped with enterprise Wi-Fi, ergonomic workstations, and RFID smart card scanners.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cafes.map((cafe) => (
                <Card key={cafe._id} className="border-stone-800 bg-stone-900/60 overflow-hidden flex flex-col justify-between">
                  <div>
                    {cafe.image ? (
                      <div className="h-48 w-full overflow-hidden bg-stone-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cafe.image}
                          alt={cafe.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-stone-800 flex items-center justify-center text-stone-500">
                        No photo
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base font-bold text-white">{cafe.name}</h3>
                        <Badge variant={cafe.status === "ACTIVE" ? "success" : "secondary"}>
                          {cafe.status}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-stone-300">
                        <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          {cafe.address.line1}, {cafe.address.city}, {cafe.address.state} - {cafe.address.pincode}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-400 pt-2 border-t border-stone-800/80">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-stone-500" />
                          <span>{cafe.openingHours}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-stone-500" />
                          <span>{cafe.seatingCapacity} seats</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        <span className="inline-flex items-center gap-1 rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300">
                          <Wifi className="h-3 w-3 text-emerald-400" /> Gigabit Wi-Fi
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300">
                          <ShieldCheck className="h-3 w-3 text-amber-400" /> RFID Gate
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link href={`/customer/menu?cafeId=${cafe._id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View Menu & Order
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

