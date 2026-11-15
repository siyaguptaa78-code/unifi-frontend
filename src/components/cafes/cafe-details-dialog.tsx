"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatPoints } from "@/lib/utils";

function Stat({ label, value, tone = "text-white" }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="rounded-lg border border-stone-800 bg-stone-950 p-2.5">
      <div className="text-[10px] text-stone-500">{label}</div>
      <div className={`text-sm font-bold ${tone}`}>{value}</div>
    </div>
  );
}

/** Read-only details for one cafe (franchise owner / supervisor / admin "eye" button). */
export function CafeDetailsDialog({ cafeId, onClose }: { cafeId: string | null; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cafeId) return;
    setData(null);
    setError(null);
    fetch(`/api/cafes/${cafeId}/overview`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message || "Could not load cafe");
        setData(j.data);
      })
      .catch((e) => setError(e.message));
  }, [cafeId]);

  const c = data?.cafe;
  const s = data?.stats;

  return (
    <Dialog open={!!cafeId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{c ? `${c.name} (${c.code})` : "Cafe details"}</DialogTitle>
          <DialogDescription>
            {c ? [c.address?.line1, c.address?.area, c.address?.city, c.address?.pincode].filter(Boolean).join(", ") : "Loading…"}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {!data && !error && (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        )}

        {data && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              <Badge variant={c.status === "ACTIVE" ? "success" : "secondary"}>{c.status}</Badge>
              <Badge variant="outline">{c.ownershipType}</Badge>
              {c.franchise && <Badge variant="outline">Franchise: {c.franchise.name}</Badge>}
              <Badge variant="outline">{c.openingHours}</Badge>
              <Badge variant="outline">{c.seatingCapacity} seats</Badge>
              <Badge variant={c.acceptsPreOrders !== false ? "success" : "secondary"}>
                {c.acceptsPreOrders !== false ? "Pre-orders on" : "Pre-orders off"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Stat label="Manager" value={c.manager?.name || "Unassigned"} />
              <Stat label="Manager phone" value={c.manager?.mobile || c.phone || "—"} />
              <Stat label="Supervisor" value={c.supervisor?.name || "—"} />
              <Stat label="Orders today" value={s.todayOrders} />
              <Stat label="Open orders now" value={s.pendingOrders} tone="text-amber-400" />
              <Stat label="Customers inside now" value={s.activeVisitors} tone="text-emerald-400" />
              <Stat label="Orders (30 days)" value={s.orders30d} />
              <Stat label="Sales (30 days)" value={formatPoints(s.orderPoints30d)} tone="text-amber-400" />
              <Stat label="Visits (30 days)" value={s.visits30d} />
              <Stat label="Points allocated" value={formatPoints(s.pointsAllocated)} />
              <Stat label="Points used (all time)" value={formatPoints(s.pointsUsed)} tone="text-amber-400" />
              <Stat label="Points used (30 days)" value={formatPoints(s.pointsUsed30d)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-white mb-1.5">Staff ({data.staff.length})</div>
                {data.staff.length === 0 ? (
                  <p className="text-stone-500">No staff assigned.</p>
                ) : (
                  <ul className="space-y-1">
                    {data.staff.map((p: any, i: number) => (
                      <li key={i} className="flex justify-between text-stone-300">
                        <span>
                          {p.name} <span className="text-stone-500">· {p.designation || p.position}</span>
                        </span>
                        <span className="text-stone-500">{p.mobile}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="font-bold text-white mb-1.5">🔥 Trendy at this cafe</div>
                {data.trending.length === 0 ? (
                  <p className="text-stone-500">Not enough orders yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {data.trending.map((t: any) => (
                      <li key={t.menuItemId} className="flex justify-between text-stone-300">
                        <span>{t.name}</span>
                        <span className="text-stone-500">{t.quantity} sold</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {data.rewards.length > 0 && (
              <div>
                <div className="font-bold text-white mb-1.5">Recent rewards</div>
                <ul className="space-y-1">
                  {data.rewards.map((r: any, i: number) => (
                    <li key={i} className="flex justify-between text-stone-300">
                      <span>{r.note}</span>
                      <span className="text-emerald-400">
                        +{formatPoints(r.points)} · {formatDate(r.at)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
