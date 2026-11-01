"use client";

import React, { useEffect, useState } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { UtensilsCrossed, Plus, Check, X, Tag } from "lucide-react";
import { formatPoints } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any>({ items: [], prices: [] });
  const [loading, setLoading] = useState(true);

  // New item modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pointsPrice, setPointsPrice] = useState(250);
  const [isVeg, setIsVeg] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [itRes, catRes, appRes] = await Promise.all([
        fetch("/api/menu/items"),
        fetch("/api/menu/categories"),
        fetch("/api/menu/approvals"),
      ]);
      if (itRes.ok) setItems((await itRes.json()).data || []);
      if (catRes.ok) {
        const cats = (await catRes.json()).data || [];
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0]._id);
      }
      if (appRes.ok) setApprovals((await appRes.json()).data || { items: [], prices: [] });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCentralItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category: categoryId,
          pointsPrice,
          isVeg,
          active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to create menu item");
      toast.success("Central menu item created successfully");
      setItemModalOpen(false);
      setName("");
      setDescription("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewApproval = async (type: "LOCAL_ITEM" | "PRICE_OVERRIDE", id: string, approve: boolean) => {
    try {
      const res = await fetch("/api/menu/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, approve }),
      });
      if (res.ok) {
        toast.success(approve ? "Approved!" : "Rejected");
        loadData();
      }
    } catch {
      toast.error("Review action failed");
    }
  };

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Central Menu Governance & Approvals"
        description="Manage central master items and review local cafe menu requests and price overrides."
        badge="Menu Governance"
        action={
          <Button onClick={() => setItemModalOpen(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            <span>Add Central Menu Item</span>
          </Button>
        }
      />

      {/* Pending Approval Requests Section */}
      {((approvals.prices && approvals.prices.length > 0) || (approvals.items && approvals.items.length > 0)) && (
        <Card className="border-amber-500/40 bg-amber-950/15 p-5 space-y-4">
          <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Pending Local Price Overrides & Items ({approvals.prices?.length || 0})</span>
          </CardTitle>

          <div className="space-y-2">
            {approvals.prices?.map((p: any) => (
              <div key={p._id} className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">
                    {p.menuItem?.name} @ {p.cafe?.name}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Standard: {p.menuItem?.pointsPrice} pts &rarr; Requested Override:{" "}
                    <strong className="text-amber-400">{p.requestedPrice} pts</strong> (by {p.requestedBy?.name})
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => reviewApproval("PRICE_OVERRIDE", p._id, true)}
                    className="h-7 px-2.5 text-xs font-semibold"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => reviewApproval("PRICE_OVERRIDE", p._id, false)}
                    className="h-7 px-2.5 text-xs"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Master Menu Items */}
      <Card className="border-stone-800 bg-stone-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Central Menu Catalog ({items.length} Items)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price (Points)</TableHead>
                  <TableHead>Dietary</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it._id}>
                    <TableCell className="font-semibold text-xs text-white">
                      <div>{it.name}</div>
                      <div className="text-[11px] text-stone-400 max-w-sm truncate">{it.description}</div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-300">
                      {it.category?.name}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs text-amber-400">
                      {formatPoints(it.pointsPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={it.isVeg ? "success" : "destructive"} className="text-[10px]">
                        {it.isVeg ? "Veg" : "Non-Veg"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {it.scope}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">
                        {it.approvalStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Central Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Central Menu Item</DialogTitle>
            <DialogDescription>
              New item will be deployed across all registered cafes in India.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCentralItem} className="space-y-3.5 py-2">
            <Input label="Item Name" placeholder="Double Dark Mocha" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Description" placeholder="Artisanal Belgian chocolate with double espresso" value={description} onChange={(e) => setDescription(e.target.value)} required />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-stone-100"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Points Price (1 pt = ₹1)" type="number" value={pointsPrice} onChange={(e) => setPointsPrice(Number(e.target.value))} required />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isVegCheckbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="rounded border-stone-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isVegCheckbox" className="text-xs text-stone-300">
                Vegetarian Recipe
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button type="button" variant="ghost" onClick={() => setItemModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting} className="font-bold">
                Create Central Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

