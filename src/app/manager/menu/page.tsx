"use client";

import React, { useState, useEffect } from "react";
import { PortalLayout } from "@/components/layout/portal-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Utensils, Check, X, Tag, Plus, ArrowUpRight } from "lucide-react";
import { formatPoints } from "@/lib/utils";
import { toast } from "sonner";

export default function ManagerMenuPage() {
  const [cafes, setCafes] = useState<any[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Price override modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [requestedPrice, setRequestedPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCafes() {
      try {
        const res = await fetch("/api/cafes");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setCafes(list);
          if (list.length > 0) setSelectedCafeId(list[0]._id);
        }
      } catch {
        // ignore
      }
    }
    loadCafes();
  }, []);

  const loadMenu = async () => {
    if (!selectedCafeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/menu/cafe/${selectedCafeId}?includeUnavailable=true`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [selectedCafeId]);

  const toggleAvailability = async (itemId: string, current: boolean) => {
    try {
      const res = await fetch("/api/menu/customizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_availability",
          cafeId: selectedCafeId,
          menuItemId: itemId,
          isAvailable: !current,
        }),
      });
      if (res.ok) {
        toast.success(`Item marked as ${!current ? "Available" : "Unavailable (86'd)"}`);
        loadMenu();
      }
    } catch {
      toast.error("Failed to toggle availability");
    }
  };

  const handleRequestPriceOverride = async () => {
    if (!selectedItem || requestedPrice <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/menu/customizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_price_override",
          cafeId: selectedCafeId,
          menuItemId: selectedItem._id,
          price: requestedPrice,
        }),
      });
      if (res.ok) {
        toast.success("Price override request submitted to Super Admin for approval.");
        setPriceModalOpen(false);
        loadMenu();
      }
    } catch {
      toast.error("Failed to submit price override request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout allowedRoles={["MANAGER", "FRANCHISE_OWNER", "SUPER_ADMIN"]}>
      <PageHeader
        title="Cafe Menu Governance"
        description="Manage daily item availability and submit local cafe price requests."
        badge="Menu Availability"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">Cafe:</span>
            <select
              value={selectedCafeId}
              onChange={(e) => setSelectedCafeId(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-white"
            >
              {cafes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        }
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
                  <TableHead>Menu Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Central Price</TableHead>
                  <TableHead className="text-right">Effective Cafe Price</TableHead>
                  <TableHead>Price Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="text-xs font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-400">
                      {item.category?.name}
                    </TableCell>
                    <TableCell className="text-right text-xs text-stone-400">
                      {formatPoints(item.basePrice)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-bold text-amber-400">
                      {formatPoints(item.pointsPrice)}
                    </TableCell>
                    <TableCell>
                      {item.priceStatus === "PENDING" ? (
                        <Badge variant="warning" className="text-[10px]">
                          Pending Approval ({item.pendingPrice} pts)
                        </Badge>
                      ) : item.priceOverridden ? (
                        <Badge variant="success" className="text-[10px]">
                          Approved Override
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-stone-500">Standard</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleAvailability(item._id, item.isAvailable)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          item.isAvailable
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                        }`}
                      >
                        {item.isAvailable ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>{item.isAvailable ? "Available" : "86'd / Out of Stock"}</span>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setRequestedPrice(item.pointsPrice);
                          setPriceModalOpen(true);
                        }}
                        className="h-7 text-[11px] gap-1"
                      >
                        <Tag className="h-3 w-3 text-amber-500" />
                        <span>Request Price</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Price Override Modal */}
      <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Request Price Override for {selectedItem?.name}
            </DialogTitle>
            <DialogDescription>
              Local pricing overrides require Super Admin approval before becoming active.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <span className="text-stone-400">Current Standard Central Price:</span>
              <span className="font-bold text-white ml-2">{selectedItem?.basePrice} points</span>
            </div>
            <Input
              label="Requested Local Price (Points = ₹)"
              type="number"
              value={requestedPrice}
              onChange={(e) => setRequestedPrice(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setPriceModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestPriceOverride} isLoading={submitting} className="font-bold">
              Submit Request to Super Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

