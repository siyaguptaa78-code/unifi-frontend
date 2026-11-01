"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { History, ShieldCheck, AlertTriangle } from "lucide-react";
import { formatDateTime, formatMinutes } from "@/lib/utils";
import { toast } from "sonner";

export default function ManagerVisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Correction modal
  const [correctModalOpen, setCorrectModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [exitTime, setExitTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVisits = async () => {
    try {
      const res = await fetch("/api/visits");
      if (res.ok) {
        const json = await res.json();
        setVisits(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleCorrectVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/visits/${selectedVisit._id}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exitAt: exitTime, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to correct visit session");
      toast.success("Visit session corrected and customer membership hours adjusted.");
      setCorrectModalOpen(false);
      loadVisits();
    } catch (err: any) {
      toast.error(err.message || "Failed to correct session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["MANAGER", "SUPERVISOR", "SUPER_ADMIN"]}>
      <PageHeader
        title="Cafe Visit & Session Records"
        description="Monitor active check-in durations, view exit records and perform audited corrections for missed taps."
        badge="Access Control"
      />

      <Card className="border-stone-800 bg-stone-900/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Card UID</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((vis) => (
                  <TableRow key={vis._id}>
                    <TableCell className="text-xs font-semibold text-white">
                      <div>{vis.customer?.name}</div>
                      <div className="text-[10px] text-stone-500">{vis.customer?.mobile}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-400">
                      {vis.card?.uid || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {formatDateTime(vis.entryAt)}
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {vis.exitAt ? formatDateTime(vis.exitAt) : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-stone-200">
                      {vis.status === "ACTIVE" ? (
                        <span className="text-amber-400 font-bold">In Progress</span>
                      ) : (
                        formatMinutes(vis.minutesConsumed)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={vis.status === "ACTIVE" ? "warning" : vis.status === "CORRECTED" ? "info" : "secondary"}>
                        {vis.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVisit(vis);
                          setExitTime(new Date().toISOString().slice(0, 16));
                          setReason("Customer missed tapping card at exit");
                          setCorrectModalOpen(true);
                        }}
                        className="h-7 text-[11px]"
                      >
                        Correct
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Correction Modal */}
      <Dialog open={correctModalOpen} onOpenChange={setCorrectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <span>Correct Visit Session</span>
            </DialogTitle>
            <DialogDescription>
              Session for {selectedVisit?.customer?.name}. Re-calculates usage and writes an audited adjustment ledger.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCorrectVisit} className="space-y-3.5 py-2">
            <Input
              label="Accurate Exit Date & Time"
              type="datetime-local"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              required
            />
            <Input
              label="Audited Correction Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Turnstile gate failure / Customer forgot to tap"
              required
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCorrectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting} className="font-bold">
                Apply Session Correction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

