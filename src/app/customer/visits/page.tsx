"use client";

import React, { useEffect, useState } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { History, MapPin, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { formatMinutes, formatDateTime } from "@/lib/utils";

export default function CustomerVisitsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customer/visits");
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

  const visits = data?.visits || [];
  const active = data?.active;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <History className="h-6 w-6 text-amber-500" />
              <span>Cafe Visits & Access Log</span>
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Every contactless NFC/RFID tap in and tap out session with minute-accurate deduction.
            </p>
          </div>

          {/* Active Visit Spotlight */}
          {active && (
            <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/30 via-stone-900/80 to-stone-900/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold animate-pulse">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Live Check-In Session
                    </span>
                    <Badge variant="success">IN PROGRESS</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{active.cafe?.name}</h3>
                  <div className="text-xs text-stone-300 flex items-center gap-2 mt-1">
                    <span>Tapped in at {formatDateTime(active.entryAt)}</span>
                    <span>•</span>
                    <span>Device: {active.entryDevice || "DESK_TERMINAL"}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-stone-400 max-w-xs text-right">
                Tap your NFC/RFID card again at the cafe exit counter to conclude your session.
              </div>
            </div>
          )}

          {/* Visits History Table */}
          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Historical Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {visits.length === 0 ? (
                <EmptyState
                  title="No visits recorded"
                  description="When you scan your membership card at an entrance reader, your visits will appear here."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cafe Location</TableHead>
                      <TableHead>Check-In Time</TableHead>
                      <TableHead>Check-Out Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Duration Charged</TableHead>
                      <TableHead className="text-right">Hours Left After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((vis: any) => (
                      <TableRow key={vis._id}>
                        <TableCell className="font-semibold text-xs text-white">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>{vis.cafe?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-stone-300">
                          {formatDateTime(vis.entryAt)}
                        </TableCell>
                        <TableCell className="text-xs text-stone-400">
                          {vis.exitAt ? formatDateTime(vis.exitAt) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              vis.status === "ACTIVE"
                                ? "warning"
                                : vis.status === "CORRECTED"
                                ? "info"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {vis.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-stone-200">
                          {vis.status === "ACTIVE" ? (
                            <span className="text-amber-400 font-bold">Counting...</span>
                          ) : (
                            formatMinutes(vis.minutesConsumed)
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs text-stone-400">
                          {vis.minutesAfter !== undefined ? formatMinutes(vis.minutesAfter) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

