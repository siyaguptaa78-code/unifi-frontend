"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPoints } from "@/lib/utils";
import { toast } from "sonner";

type Summary = {
  _id: string;
  name: string;
  pointsAllocated: number;
  pointsUsed: number;
  pointsUsed30d: number;
  pointsRemaining: number;
  history: { points: number; note?: string; kind: string; at: string }[];
  allowedIps: string[];
};

/** Super Admin: assign branch points and restrict staff logins to the cafe's IP addresses. */
export function BranchControlsDialog({ summary, onClose, onSaved }: { summary: Summary | null; onClose: () => void; onSaved: () => void }) {
  const [points, setPoints] = useState<number>(10000);
  const [note, setNote] = useState("");
  const [ips, setIps] = useState("");
  const [myIp, setMyIp] = useState<string | null>(null);
  const [busy, setBusy] = useState<"points" | "ips" | null>(null);

  useEffect(() => {
    if (!summary) return;
    setIps((summary.allowedIps || []).join("\n"));
    setNote("");
    fetch("/api/auth/my-ip")
      .then((r) => r.json())
      .then((j) => setMyIp(j.data?.ip ?? null))
      .catch(() => setMyIp(null));
  }, [summary]);

  if (!summary) return null;

  const allocate = async (sign: 1 | -1) => {
    setBusy("points");
    try {
      const res = await fetch(`/api/cafes/${summary._id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: sign * Math.abs(Math.round(points)), note: note || (sign > 0 ? "Points allocation" : "Points removed") }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Failed");
      toast.success(`${sign > 0 ? "Allocated" : "Removed"} ${formatPoints(Math.abs(points))} ${sign > 0 ? "to" : "from"} ${summary.name}`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const saveIps = async () => {
    setBusy("ips");
    try {
      const list = ips
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/cafes/${summary._id}/access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedIps: list }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Failed");
      toast.success(list.length ? `Logins for ${summary.name} restricted to ${list.length} IP(s)` : `IP restriction removed for ${summary.name}`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={!!summary} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{summary.name}: Points &amp; Access</DialogTitle>
          <DialogDescription>Branch points budget and login network restriction.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-stone-800 bg-stone-950 p-2">
            <div className="text-stone-500">Allocated</div>
            <div className="font-bold text-white">{formatPoints(summary.pointsAllocated)}</div>
          </div>
          <div className="rounded-lg border border-stone-800 bg-stone-950 p-2">
            <div className="text-stone-500">Used</div>
            <div className="font-bold text-amber-400">{formatPoints(summary.pointsUsed)}</div>
            <div className="text-[10px] text-stone-500">{formatPoints(summary.pointsUsed30d)} last 30d</div>
          </div>
          <div className="rounded-lg border border-stone-800 bg-stone-950 p-2">
            <div className="text-stone-500">Remaining</div>
            <div className={`font-bold ${summary.pointsRemaining < 0 ? "text-red-400" : "text-emerald-400"}`}>{formatPoints(summary.pointsRemaining)}</div>
          </div>
        </div>

        <div className="space-y-2 border-t border-stone-800 pt-3">
          <div className="text-xs font-bold text-white">Assign points</div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" isLoading={busy === "points"} onClick={() => allocate(1)}>
              Add points
            </Button>
            <Button size="sm" variant="outline" className="flex-1" disabled={busy === "points"} onClick={() => allocate(-1)}>
              Remove points
            </Button>
          </div>
          {summary.history.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto text-[11px]">
              {summary.history.map((h, i) => (
                <div key={i} className="flex justify-between gap-2 text-stone-400">
                  <span>
                    <Badge variant={h.kind === "REWARD" ? "success" : "secondary"} className="text-[9px] mr-1">
                      {h.kind}
                    </Badge>
                    {h.note}
                  </span>
                  <span className={h.points < 0 ? "text-red-400" : "text-emerald-400"}>
                    {h.points > 0 ? "+" : ""}
                    {h.points.toLocaleString("en-IN")} · {formatDateTime(h.at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-stone-800 pt-3">
          <div className="text-xs font-bold text-white">Allowed login IP addresses</div>
          <p className="text-[11px] text-stone-400">
            The franchise owner, manager and staff of this cafe can log in only from these IPs (one per line, <code>*</code> wildcard allowed, e.g.{" "}
            <code>203.0.113.*</code>). Leave empty for no restriction.
          </p>
          <textarea
            value={ips}
            onChange={(e) => setIps(e.target.value)}
            rows={4}
            placeholder={"103.21.44.10\n103.21.45.*"}
            className="w-full p-2 bg-stone-950 border border-stone-800 rounded-lg text-xs font-mono text-stone-200"
          />
          {myIp && (
            <button type="button" onClick={() => setIps((v) => (v.trim() ? `${v.trim()}\n${myIp}` : myIp))} className="text-[11px] text-amber-400 underline cursor-pointer">
              Add my current IP ({myIp})
            </button>
          )}
          <Button size="sm" className="w-full" isLoading={busy === "ips"} onClick={saveIps}>
            Save IP restriction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
