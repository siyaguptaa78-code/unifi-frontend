"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, Minus, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { formatMinutes, formatPoints } from "@/lib/utils";
import { toast } from "sonner";

type Line = { item: any; quantity: number };

export default function CounterBillingPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [cafeId, setCafeId] = useState("");
  const [menu, setMenu] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uid, setUid] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const [looking, setLooking] = useState(false);
  const [cart, setCart] = useState<Map<string, Line>>(new Map());
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    fetch("/api/cafes")
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        setCafes(list);
        if (list.length) setCafeId(list[0]._id);
      });
  }, []);

  useEffect(() => {
    if (!cafeId) return;
    setMenuLoading(true);
    setCart(new Map());
    fetch(`/api/menu/cafe/${cafeId}`)
      .then((r) => r.json())
      .then((j) => setMenu(j.data || []))
      .finally(() => setMenuLoading(false));
  }, [cafeId]);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!uid.trim()) return;
    setLooking(true);
    setCustomer(null);
    try {
      const res = await fetch(`/api/cards/by-uid?uid=${encodeURIComponent(uid.trim())}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Card not found");
      setCustomer(j.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLooking(false);
    }
  };

  const change = (item: any, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const q = (next.get(item._id)?.quantity ?? 0) + delta;
      if (q <= 0) next.delete(item._id);
      else next.set(item._id, { item, quantity: Math.min(q, 20) });
      return next;
    });
  };

  const lines = [...cart.values()];
  const total = lines.reduce((s, l) => s + l.item.pointsPrice * l.quantity, 0);
  const balance = customer?.membership?.pointsBalance ?? 0;
  const filtered = useMemo(
    () => menu.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase())),
    [menu, search]
  );

  const placeOrder = async () => {
    if (!customer || !lines.length) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/orders/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: customer.uid,
          cafeId,
          notes: notes || undefined,
          idempotencyKey: `ctr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          items: lines.map((l) => ({ menuItemId: l.item._id, quantity: l.quantity })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Billing failed");
      setLastOrder(j.data.order);
      toast.success(`Billed ${formatPoints(j.data.order.totalPoints)} to ${customer.customer.name}`);
      setCart(new Map());
      setNotes("");
      lookup();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["STAFF", "MANAGER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Counter Billing"
        description="Bill food to a customer's membership card. The customer can download the invoice from their app."
        badge="Card Billing"
        action={
          cafes.length > 1 ? (
            <select
              value={cafeId}
              onChange={(e) => setCafeId(e.target.value)}
              aria-label="Cafe"
              className="bg-stone-900 border border-stone-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-white"
            >
              {cafes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-stone-800 bg-stone-900/60 p-4">
            <form onSubmit={lookup} className="flex gap-2">
              <Input
                value={uid}
                onChange={(e) => setUid(e.target.value.toUpperCase())}
                placeholder="Tap or enter card UID (e.g. E20000190601)"
                className="font-mono"
              />
              <Button type="submit" isLoading={looking} className="gap-1.5 shrink-0">
                <CreditCard className="h-4 w-4" /> Find card
              </Button>
            </form>
            {customer && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-stone-800 pt-3">
                <div>
                  <span className="block text-[10px] text-stone-500">Customer</span>
                  <strong className="text-white">{customer.customer.name}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-500">Mobile</span>
                  <span className="text-stone-300">{customer.customer.mobile}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-500">Points</span>
                  <strong className="text-amber-400">{formatPoints(balance)}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-500">Hours left</span>
                  <span className="text-stone-300">{formatMinutes(customer.membership?.remainingMinutes)}</span>
                </div>
                {customer.cardStatus !== "ACTIVE" && <Badge variant="destructive">Card {customer.cardStatus}</Badge>}
              </div>
            )}
          </Card>

          <Card className="border-stone-800 bg-stone-900/60 p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu" className="pl-9" />
            </div>
            {menuLoading ? (
              <div className="p-8 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
                {filtered.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => change(m, 1)}
                    className="text-left rounded-lg border border-stone-800 bg-stone-950/60 p-3 hover:border-amber-500/50 cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-white">{m.name}</div>
                    <div className="flex justify-between mt-1 text-[11px]">
                      <span className="text-stone-500">{m.category?.name}</span>
                      <span className="font-bold text-amber-400">{formatPoints(m.pointsPrice)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="border-stone-800 bg-stone-900/60 p-4 space-y-3 h-fit">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-500" /> Bill
          </div>
          {lines.length === 0 ? (
            <p className="text-xs text-stone-500">Tap menu items to add them.</p>
          ) : (
            <div className="space-y-2">
              {lines.map((l) => (
                <div key={l.item._id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="truncate text-white">{l.item.name}</div>
                    <div className="text-stone-500">{formatPoints(l.item.pointsPrice * l.quantity)}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => change(l.item, -1)}>
                      {l.quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </Button>
                    <span className="w-5 text-center">{l.quantity}</span>
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => change(l.item, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="text-xs" />
          <div className="flex justify-between border-t border-stone-800 pt-3 text-sm font-bold">
            <span className="text-stone-300">Total</span>
            <span className="text-amber-400">{formatPoints(total)}</span>
          </div>
          {customer && total > balance && <p className="text-xs text-red-400">Not enough points on this card.</p>}
          <Button
            className="w-full font-bold"
            disabled={!customer || !lines.length || total > balance || customer.cardStatus !== "ACTIVE"}
            isLoading={placing}
            onClick={placeOrder}
          >
            Bill to card
          </Button>
          {lastOrder && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-200 space-y-1">
              <div>
                Order <span className="font-mono">{lastOrder.orderNumber}</span> billed.
              </div>
              <Link href={`/invoice/order/${lastOrder._id}`} className="font-semibold text-amber-400 underline">
                View / print invoice
              </Link>
            </div>
          )}
        </Card>
      </div>
    </PortalLayout>
  );
}
