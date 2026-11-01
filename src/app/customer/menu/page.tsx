"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { CustomerNavbar } from "@/components/layout/customer-navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Utensils,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Coins,
  CheckCircle2,
  AlertCircle,
  Coffee,
  X,
  Clock,
  Car,
  Store,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatPoints } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers";

interface CartItem {
  menuItemId: string;
  name: string;
  pointsPrice: number;
  quantity: number;
}

const PREORDER_SLOTS = [
  { id: "15-20", label: "In 15–20 Mins (Earliest)", offsetMinutes: 20 },
  { id: "30", label: "In 30 Mins", offsetMinutes: 30 },
  { id: "45", label: "In 45 Mins", offsetMinutes: 45 },
  { id: "60", label: "In 1 Hour", offsetMinutes: 60 },
  { id: "90", label: "In 1.5 Hours", offsetMinutes: 90 },
];

function CustomerMenuContent() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cafes, setCafes] = useState<any[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState<string>("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);

  // Cart & Ordering Mode
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [cartOpen, setCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<"DINE_IN" | "PRE_ORDER">("PRE_ORDER");
  const [selectedSlot, setSelectedSlot] = useState<string>("15-20");
  const [customArrivalTime, setCustomArrivalTime] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Cafes
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/cafes");
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setCafes(list);
          const defaultCafe = searchParams.get("cafeId") || list[0]?._id || "";
          setSelectedCafeId(defaultCafe);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams]);

  const activeCafe = useMemo(() => {
    return cafes.find((c) => c._id === selectedCafeId) || cafes[0];
  }, [cafes, selectedCafeId]);

  // Load Menu for selected cafe
  useEffect(() => {
    if (!selectedCafeId) return;
    async function loadMenu() {
      setMenuLoading(true);
      try {
        const res = await fetch(`/api/menu/cafe/${selectedCafeId}`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data || [];
          setMenuItems(items);

          // Extract distinct categories
          const cats = new Map();
          for (const it of items) {
            if (it.category && !cats.has(it.category._id)) {
              cats.set(it.category._id, it.category);
            }
          }
          setCategories(Array.from(cats.values()));
        }
      } catch {
        // ignore
      } finally {
        setMenuLoading(false);
      }
    }
    loadMenu();
  }, [selectedCafeId]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item._id);
      if (existing) {
        next.set(item._id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        next.set(item._id, {
          menuItemId: item._id,
          name: item.name,
          pointsPrice: item.pointsPrice,
          quantity: 1,
        });
      }
      return next;
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      if (existing && existing.quantity > 1) {
        next.set(itemId, { ...existing, quantity: existing.quantity - 1 });
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const cartList = useMemo(() => Array.from(cart.values()), [cart]);
  const cartTotalPoints = useMemo(
    () => cartList.reduce((sum, item) => sum + item.pointsPrice * item.quantity, 0),
    [cartList]
  );
  const cartItemCount = useMemo(
    () => cartList.reduce((sum, item) => sum + item.quantity, 0),
    [cartList]
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== "all" && item.category?._id !== selectedCategory) {
        return false;
      }
      if (vegOnly && !item.isVeg) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedCategory, vegOnly, searchQuery]);

  const userPoints = user?.membership?.pointsBalance ?? 0;
  const hasEnoughPoints = userPoints >= cartTotalPoints;

  const handlePlaceOrder = async () => {
    if (cartList.length === 0) return;
    if (!hasEnoughPoints) {
      toast.error(`Insufficient points. You need ${cartTotalPoints} pts but have ${userPoints} pts.`);
      return;
    }

    if (orderType === "PRE_ORDER" && activeCafe?.acceptsPreOrders === false) {
      toast.error("This cafe branch is not accepting online pre-orders today. Please order in-cafe.");
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Calculate expected arrival ISO
      let expectedArrivalTime: string | undefined;
      let slotLabel: string | undefined;

      if (orderType === "PRE_ORDER") {
        const chosen = PREORDER_SLOTS.find((s) => s.id === selectedSlot);
        const mins = chosen ? chosen.offsetMinutes : 20;
        const targetDate = new Date(Date.now() + mins * 60 * 1000);
        expectedArrivalTime = targetDate.toISOString();
        slotLabel = chosen ? chosen.label : "In 20 Mins";
      } else {
        slotLabel = "Immediate In-Cafe Dine-In";
      }

      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId: selectedCafeId,
          orderType: orderType === "DINE_IN" ? "IN_CAFE" : "PRE_ORDER",
          expectedArrivalTime,
          pickupSlot: slotLabel,
          notes: orderNotes,
          idempotencyKey,
          items: cartList.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Order placement failed");

      toast.success(`Order ${json.data.order?.orderNumber} placed successfully!`);
      setCart(new Map());
      setCartOpen(false);
      await refreshUser();
      router.push(`/customer/orders?id=${json.data.order?._id}`);
    } catch (err: any) {
      toast.error(err.message || "Could not place order");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col pb-28">
      <CustomerNavbar />

      <main className="flex-1 py-6 sm:py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
          {/* Header & Location Selection */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="gap-1 py-0.5 px-2 text-[10px]">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Cafe Points Menu</span>
                </Badge>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                  1 Point = ₹1 INR
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Utensils className="h-7 w-7 text-amber-500" />
                <span>Handcrafted Menu & Online Ordering</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
                Order before arriving or while seated at your table. All food and beverages are prepared fresh at your selected branch.
              </p>
            </div>

            {/* Branch Selector */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Selected Branch</div>
                  <select
                    value={selectedCafeId}
                    onChange={(e) => {
                      setSelectedCafeId(e.target.value);
                      setCart(new Map());
                      toast.info("Switched cafe location. Cart updated.");
                    }}
                    className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-4"
                  >
                    {cafes.map((c) => (
                      <option key={c._id} value={c._id} className="bg-stone-900 text-white">
                        {c.name} — {c.address?.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Cafe Information & Pre-Order Policy Card */}
          {activeCafe && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{activeCafe.name}</span>
                  <Badge variant="success" className="text-[10px]">OPEN</Badge>
                </div>
                <p className="text-xs text-stone-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{activeCafe.address?.line1}, {activeCafe.address?.city} ({activeCafe.address?.pincode})</span>
                </p>
                <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span>Hours: {activeCafe.openingHours || "08:00 - 23:00"}</span>
                </p>
              </div>

              {/* Order Mode Feature Box */}
              <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-3 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  <span>Dual Ordering Modes</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  <strong>1. Pre-Order Online:</strong> Order before leaving home or office, collect fresh upon arrival.<br />
                  <strong>2. Dine-In:</strong> Order from your seat once checked in.
                </p>
              </div>

              {/* Strict No Delivery Notice */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 flex items-start gap-2.5 text-xs text-amber-300">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white block">In-Cafe Collection / Dine-In Only</span>
                  UniCafe does not provide home delivery. All orders must be enjoyed or picked up at this selected branch.
                </div>
              </div>
            </div>
          )}

          {/* Search, Veg Filter, and Categories */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search single-origin espresso, matcha, bowls, flatbreads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-xs bg-stone-900 border-stone-800"
                />
              </div>

              <Button
                variant={vegOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setVegOnly(!vegOnly)}
                className="h-10 px-4 gap-2 text-xs font-semibold cursor-pointer"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Vegetarian Only</span>
              </Button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-amber-600 text-stone-950 shadow-md shadow-amber-600/20"
                    : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
                }`}
              >
                All Categories ({menuItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat._id
                      ? "bg-amber-600 text-stone-950 shadow-md shadow-amber-600/20"
                      : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {menuLoading ? (
            <div className="flex justify-center p-16">
              <Spinner size="lg" />
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No menu items found"
              description="No handcrafted items matched your search or category filter."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setVegOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const qtyInCart = cart.get(item._id)?.quantity || 0;
                return (
                  <Card
                    key={item._id}
                    className="border-stone-800/80 bg-stone-900/50 p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${
                              item.isVeg ? "bg-emerald-500" : "bg-red-500"
                            }`}
                            title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                          />
                          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                            {item.category?.name}
                          </span>
                        </div>
                        {item.priceOverridden && (
                          <Badge variant="default" className="text-[9px]">Branch Special</Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500 font-medium">Points Price</span>
                        <span className="font-extrabold text-amber-400 text-sm">
                          {formatPoints(item.pointsPrice)}
                        </span>
                      </div>

                      {qtyInCart === 0 ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => addToCart(item)}
                          className="h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 bg-stone-800 rounded-lg p-1 border border-stone-700">
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="h-6 w-6 flex items-center justify-center text-stone-300 hover:text-white rounded hover:bg-stone-700 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white px-1">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="h-6 w-6 flex items-center justify-center text-stone-300 hover:text-white rounded hover:bg-stone-700 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-800 bg-stone-950/95 backdrop-blur-md p-4 shadow-2xl">
          <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-stone-400 font-medium">
                  {cartItemCount} item{cartItemCount > 1 ? "s" : ""} selected for <strong>{activeCafe?.name}</strong>
                </div>
                <div className="text-base font-bold text-white">
                  Total Points: <span className="text-amber-400">{formatPoints(cartTotalPoints)}</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setCartOpen(true)}
              className="font-bold gap-2 shadow-lg shadow-amber-600/30 cursor-pointer"
            >
              <span>Review & Place Order</span>
              <Coins className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-lg bg-stone-900 border-stone-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag className="h-5 w-5 text-amber-500" />
              <span>Review Your UniCafe Order</span>
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs">
              Orders are prepared fresh at <strong>{activeCafe?.name}</strong>. In-store collection or dine-in only (no home delivery).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Order Mode Toggle: Dine-In vs Pre-Order */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                Select Order Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType("PRE_ORDER")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    orderType === "PRE_ORDER"
                      ? "border-amber-500 bg-amber-950/30 text-white shadow-md shadow-amber-500/10"
                      : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                    <Car className="h-4 w-4" />
                    <span>Pre-Order Online</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                    Order before arrival. Ready when you arrive at cafe.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("DINE_IN")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    orderType === "DINE_IN"
                      ? "border-amber-500 bg-amber-950/30 text-white shadow-md shadow-amber-500/10"
                      : "border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                    <Store className="h-4 w-4" />
                    <span>In-Cafe Dine-In</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                    Order while inside the cafe. Served directly to you.
                  </p>
                </button>
              </div>
            </div>

            {/* Pre-Order Slot Selection */}
            {orderType === "PRE_ORDER" && (
              <div className="space-y-2 rounded-xl border border-stone-800 bg-stone-950 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Expected Arrival / Pickup Slot</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Kitchen prep ~15m</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {PREORDER_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedSlot === slot.id
                          ? "bg-amber-600 text-stone-950 font-bold"
                          : "bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Line items list */}
            <div className="max-h-52 overflow-y-auto divide-y divide-stone-800 pr-1">
              {cartList.map((item) => (
                <div key={item.menuItemId} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-stone-400 text-[11px]">
                      {item.pointsPrice} pts × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-400">
                      {item.pointsPrice * item.quantity} pts
                    </span>
                    <button
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="text-stone-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Preparation Notes */}
            <Input
              label="Preparation Notes / Dietary Requests (Optional)"
              placeholder="e.g. Extra hot, no sugar, oat milk preferred"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="text-xs h-9 bg-stone-950 border-stone-800"
            />

            {/* Wallet points balance summary */}
            <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs space-y-2">
              <div className="flex justify-between text-stone-400">
                <span>Available Points Wallet:</span>
                <span className="font-bold text-white">{formatPoints(userPoints)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Order Total:</span>
                <span className="font-bold text-amber-400">{formatPoints(cartTotalPoints)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-800 font-semibold">
                <span>Remaining After Order:</span>
                <span className={hasEnoughPoints ? "text-emerald-400" : "text-red-400"}>
                  {hasEnoughPoints ? formatPoints(userPoints - cartTotalPoints) : "Insufficient Points"}
                </span>
              </div>
            </div>

            {!hasEnoughPoints && (
              <div className="rounded-xl bg-red-950/30 border border-red-500/40 p-3 text-xs text-red-300 flex items-center justify-between">
                <span>You need {formatPoints(cartTotalPoints - userPoints)} more points.</span>
                <a href="/customer/membership" className="underline font-bold text-amber-400">
                  Recharge Now
                </a>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCartOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !hasEnoughPoints || cartList.length === 0}
              className="font-bold gap-2 text-xs shadow-lg shadow-amber-600/30"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Processing Points...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order ({formatPoints(cartTotalPoints)})</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <CustomerMenuContent />
    </Suspense>
  );
}
