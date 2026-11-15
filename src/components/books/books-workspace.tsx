"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { BookOpen, Plus, RotateCcw, ShoppingCart } from "lucide-react";
import { formatDate, formatPoints } from "@/lib/utils";
import { toast } from "sonner";

type Props = { canManage: boolean; canSell: boolean };

const emptyForm = { title: "", author: "", isbn: "", pricePoints: 299, stock: 1, cafeId: "" };

export function BooksWorkspace({ canManage, canSell }: Props) {
  const [tab, setTab] = useState<"inventory" | "desk">(canManage ? "inventory" : "desk");
  const [cafes, setCafes] = useState<any[]>([]);
  const [cafeId, setCafeId] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<number[]>([]);

  // inventory
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // desk
  const [sellBook, setSellBook] = useState<any>(null);
  const [sellUid, setSellUid] = useState("");
  const [selling, setSelling] = useState(false);
  const [returnUid, setReturnUid] = useState("");
  const [sales, setSales] = useState<any[] | null>(null);
  const [returning, setReturning] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cafes")
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        setCafes(list);
        if (list.length) setCafeId(list[0]._id);
      });
  }, []);

  const loadBooks = async () => {
    if (!cafeId) return;
    setLoading(true);
    try {
      const j = await fetch(`/api/books?cafeId=${cafeId}`).then((r) => r.json());
      setBooks(j.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
    setSales(null);
  }, [cafeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cafeId: form.cafeId || cafeId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Could not save book");
      toast.success("Book added");
      setFormOpen(false);
      setForm(emptyForm);
      loadBooks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const patchBook = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/books/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (!res.ok) return toast.error(j.error?.message || "Update failed");
    loadBooks();
  };

  const doSell = async () => {
    if (!sellBook || !sellUid.trim()) return;
    setSelling(true);
    try {
      const res = await fetch(`/api/books/${sellBook._id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: sellUid.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Sale failed");
      toast.success(`Sold "${sellBook.title}" for ${formatPoints(sellBook.pricePoints)}`);
      setSellBook(null);
      setSellUid("");
      loadBooks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSelling(false);
    }
  };

  const findSales = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!returnUid.trim()) return;
    const j = await fetch(`/api/books/sales?cafeId=${cafeId}&uid=${encodeURIComponent(returnUid.trim())}`).then((r) => r.json());
    setSales(j.data?.sales || []);
    setPolicy(j.data?.policy || []);
  };

  const doReturn = async (sale: any) => {
    setReturning(sale._id);
    try {
      const res = await fetch(`/api/books/sales/${sale._id}/return`, { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Return failed");
      toast.success(`Returned. ${formatPoints(j.data.refundPoints)} refunded (${j.data.deductionPercent}% kept).`);
      findSales();
      loadBooks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReturning(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {canManage && (
            <Button size="sm" variant={tab === "inventory" ? "default" : "outline"} onClick={() => setTab("inventory")}>
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Inventory
            </Button>
          )}
          {canSell && (
            <Button size="sm" variant={tab === "desk" ? "default" : "outline"} onClick={() => setTab("desk")}>
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Sell & Return
            </Button>
          )}
        </div>
        {cafes.length > 1 && (
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
        )}
      </div>

      {tab === "inventory" && canManage && (
        <Card className="border-stone-800 bg-stone-900/60">
          <div className="flex justify-end p-3 border-b border-stone-800">
            <Button size="sm" onClick={() => setFormOpen(true)} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add book
            </Button>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-10 flex justify-center">
                <Spinner />
              </div>
            ) : books.length === 0 ? (
              <EmptyState title="No books at this cafe" description="Add books customers can buy and return." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="text-xs">
                        <div className="font-semibold text-white">{b.title}</div>
                        <div className="text-[10px] text-stone-500">{b.author}</div>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-amber-400">{formatPoints(b.pricePoints)}</TableCell>
                      <TableCell className="text-right text-xs">
                        <div className="inline-flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => patchBook(b._id, { stock: Math.max(0, b.stock - 1) })}>
                            −
                          </Button>
                          <span className="w-6 text-center text-white">{b.stock}</span>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => patchBook(b._id, { stock: b.stock + 1 })}>
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.active ? "success" : "secondary"}>{b.active ? "On shelf" : "Hidden"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => patchBook(b._id, { active: !b.active })}>
                          {b.active ? "Hide" : "Show"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "desk" && canSell && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-stone-800 bg-stone-900/60 p-4 space-y-3">
            <div className="text-sm font-bold text-white">Sell a book</div>
            {loading ? (
              <Spinner />
            ) : books.filter((b) => b.active).length === 0 ? (
              <p className="text-xs text-stone-500">No books on the shelf at this cafe.</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {books
                  .filter((b) => b.active)
                  .map((b) => (
                    <div key={b._id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{b.title}</div>
                        <div className="text-stone-500">
                          {formatPoints(b.pricePoints)} · {b.stock} in stock
                        </div>
                      </div>
                      <Button size="sm" disabled={b.stock <= 0} onClick={() => setSellBook(b)}>
                        Sell
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          <Card className="border-stone-800 bg-stone-900/60 p-4 space-y-3">
            <div className="text-sm font-bold text-white">Process a return</div>
            <form onSubmit={findSales} className="flex gap-2">
              <Input value={returnUid} onChange={(e) => setReturnUid(e.target.value.toUpperCase())} placeholder="Customer card UID" className="font-mono" />
              <Button type="submit" className="shrink-0">
                Find
              </Button>
            </form>
            {policy.length > 0 && (
              <p className="text-[11px] text-stone-500">
                Policy: {policy.map((p, i) => `month ${i + 1} → ${100 - p}% back`).join(" · ")} · after that no return.
              </p>
            )}
            {sales && sales.length === 0 && <p className="text-xs text-stone-500">No books bought by this card at this cafe.</p>}
            {sales && sales.length > 0 && (
              <div className="space-y-2">
                {sales.map((s) => (
                  <div key={s._id} className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{s.title}</div>
                      <div className="text-stone-500">
                        Bought {formatDate(s.soldAt)} for {formatPoints(s.pricePoints)}
                      </div>
                      {s.status === "SOLD" && s.quote?.returnable && (
                        <div className="text-emerald-400">
                          Refund now: {formatPoints(s.quote.refundPoints)} (month {s.quote.month}, {s.quote.deductionPercent}% kept)
                        </div>
                      )}
                      {s.status === "SOLD" && !s.quote?.returnable && <div className="text-amber-400">Past return window — book belongs to customer</div>}
                      {s.status === "RETURNED" && <div className="text-stone-400">Returned · {formatPoints(s.refundPoints)} refunded</div>}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 items-end">
                      {s.status === "SOLD" && s.quote?.returnable && (
                        <Button size="sm" variant="outline" isLoading={returning === s._id} onClick={() => doReturn(s)} className="gap-1">
                          <RotateCcw className="h-3 w-3" /> Return
                        </Button>
                      )}
                      <Link href={`/invoice/book/${s._id}`} className="text-[11px] text-amber-400 underline">
                        Invoice
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add book dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a book</DialogTitle>
            <DialogDescription>Customers pay in points (1 point = ₹1).</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveBook} className="space-y-3">
            {cafes.length > 1 && (
              <select
                value={form.cafeId || cafeId}
                onChange={(e) => setForm({ ...form, cafeId: e.target.value })}
                aria-label="Cafe"
                className="w-full bg-stone-900 border border-stone-800 rounded-lg text-xs px-3 py-2 text-white"
              >
                {cafes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (points)"
                type="number"
                min={1}
                value={form.pricePoints}
                onChange={(e) => setForm({ ...form, pricePoints: Number(e.target.value) })}
                required
              />
              <Input label="Stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                Save book
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sell dialog */}
      <Dialog open={!!sellBook} onOpenChange={(o) => !o && setSellBook(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sell &quot;{sellBook?.title}&quot;</DialogTitle>
            <DialogDescription>{formatPoints(sellBook?.pricePoints)} will be deducted from the customer&apos;s card.</DialogDescription>
          </DialogHeader>
          <Input value={sellUid} onChange={(e) => setSellUid(e.target.value.toUpperCase())} placeholder="Customer card UID" className="font-mono" autoFocus />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSellBook(null)}>
              Cancel
            </Button>
            <Button onClick={doSell} isLoading={selling} disabled={!sellUid.trim()}>
              Confirm sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
