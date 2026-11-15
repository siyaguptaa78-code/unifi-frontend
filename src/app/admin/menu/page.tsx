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
import { EmptyState } from "@/components/ui/empty-state";
import {
  UtensilsCrossed,
  Plus,
  Check,
  X,
  Tag,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  FolderPlus,
} from "lucide-react";
import { formatPoints } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState<"ITEMS" | "CATEGORIES" | "APPROVALS">("ITEMS");
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any>({ items: [], prices: [] });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Item form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pointsPrice, setPointsPrice] = useState(250);
  const [isVeg, setIsVeg] = useState(true);
  const [image, setImage] = useState("");
  const [itemActive, setItemActive] = useState(true);

  // Category form states
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [catActive, setCatActive] = useState(true);

  const [trendingIds, setTrendingIds] = useState<string[]>([]);

  const setTrendingMode = async (item: any, mode: "AUTO" | "PINNED" | "HIDDEN") => {
    const res = await fetch(`/api/menu/items/${item._id}/trending`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const json = await res.json();
    if (!res.ok) return toast.error(json.error?.message || "Could not update Trendy Food");
    toast.success(mode === "PINNED" ? `${item.name} pinned as Trendy` : mode === "HIDDEN" ? `${item.name} hidden from Trendy` : `${item.name} set to automatic`);
    loadData();
  };

  const loadData = async () => {
    try {
      const [itRes, catRes, appRes, trRes] = await Promise.all([
        fetch("/api/menu/items"),
        fetch("/api/menu/categories"),
        fetch("/api/menu/approvals"),
        fetch("/api/menu/trending"),
      ]);
      if (trRes.ok) setTrendingIds(((await trRes.json()).data || []).map((t: any) => t.menuItemId));

      if (itRes.ok) setItems((await itRes.json()).data || []);
      if (catRes.ok) {
        const cats = (await catRes.json()).data || [];
        setCategories(cats);
        if (cats.length > 0 && !categoryId) setCategoryId(cats[0]._id);
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

  const openCreateItem = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setPointsPrice(250);
    setIsVeg(true);
    setImage("");
    setItemActive(true);
    if (categories.length > 0) setCategoryId(categories[0]._id);
    setItemModalOpen(true);
  };

  const openEditItem = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setCategoryId(item.category?._id || item.category || (categories[0]?._id ?? ""));
    setPointsPrice(item.pointsPrice || 250);
    setIsVeg(item.isVeg ?? true);
    setImage(item.image || "");
    setItemActive(item.active ?? true);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        category: categoryId,
        pointsPrice: Number(pointsPrice),
        isVeg,
        image: image || undefined,
        active: itemActive,
      };

      const url = editingItem ? `/api/menu/items/${editingItem._id}` : "/api/menu/items";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Operation failed");

      toast.success(editingItem ? `Menu item ${name} updated` : `Menu item ${name} created`);
      setItemModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItemActive = async (item: any) => {
    try {
      const res = await fetch(`/api/menu/items/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          category: item.category?._id || item.category,
          active: !item.active,
        }),
      });
      if (res.ok) {
        toast.success(`Item ${item.name} is now ${!item.active ? "ACTIVE" : "INACTIVE"}`);
        loadData();
      }
    } catch {
      toast.error("Failed to toggle item");
    }
  };

  const openCreateCat = () => {
    setEditingCat(null);
    setCatName("");
    setCatDesc("");
    setSortOrder(categories.length);
    setCatActive(true);
    setCatModalOpen(true);
  };

  const openEditCat = (cat: any) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || "");
    setSortOrder(cat.sortOrder || 0);
    setCatActive(cat.active ?? true);
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: catName,
        description: catDesc,
        sortOrder: Number(sortOrder),
        active: catActive,
      };

      const url = editingCat ? `/api/menu/categories/${editingCat._id}` : "/api/menu/categories";
      const method = editingCat ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Operation failed");

      toast.success(editingCat ? `Category ${catName} updated` : `Category ${catName} created`);
      setCatModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
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

  const filteredItems = items.filter((it) => {
    const matchCat = categoryFilter === "ALL" || it.category?._id === categoryFilter || it.category === categoryFilter;
    const matchQuery =
      !searchQuery ||
      it.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const pendingApprovalsCount = (approvals.items?.length || 0) + (approvals.prices?.length || 0);

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Central Menu Governance & Food Catalog"
        description="Global menu management across all UniCafe locations. Govern base points pricing, nutritional flags, categories, and branch-level customization approvals."
        badge="Catalog Governance"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={openCreateCat} className="text-xs h-9">
              <FolderPlus className="h-4 w-4 mr-1.5" />
              New Category
            </Button>
            <Button size="sm" onClick={openCreateItem} className="text-xs h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Menu Item
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("ITEMS")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "ITEMS" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Menu Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("CATEGORIES")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "CATEGORIES" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("APPROVALS")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "APPROVALS" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          Branch Approvals
          {pendingApprovalsCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Menu Items */}
      {activeTab === "ITEMS" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  categoryFilter === "ALL" ? "bg-amber-600 text-stone-950 font-bold" : "bg-stone-900 text-stone-400 hover:text-white"
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setCategoryFilter(c._id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    categoryFilter === c._id ? "bg-amber-600 text-stone-950 font-bold" : "bg-stone-900 text-stone-400 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
              <Input
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-16 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : filteredItems.length === 0 ? (
                <EmptyState title="No menu items found" description="Try selecting another category or add a new central menu item." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Price (Points)</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Trendy Food</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((it) => (
                      <TableRow key={it._id}>
                        <TableCell className="font-semibold text-xs text-white">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${it.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                            <div>
                              <div>{it.name}</div>
                              {it.description && <div className="text-[10px] text-stone-400 font-normal max-w-sm truncate">{it.description}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-stone-300">
                          {it.category?.name || "General"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={it.isVeg ? "success" : "destructive"} className="text-[10px]">
                            {it.isVeg ? "VEG" : "NON-VEG"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-amber-400">
                          {formatPoints(it.pointsPrice)}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleItemActive(it)}
                            className="cursor-pointer"
                            title="Click to toggle availability"
                          >
                            <Badge variant={it.active ? "success" : "secondary"} className="text-[10px]">
                              {it.active ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {trendingIds.includes(it._id) && <span title="Currently shown as Trendy Food">🔥</span>}
                            <select
                              value={it.trendingMode || "AUTO"}
                              onChange={(e) => setTrendingMode(it, e.target.value as any)}
                              className="bg-stone-950 border border-stone-800 rounded-md text-[11px] px-1.5 py-1 text-white"
                              title="Auto = ranked by orders · Pinned = always Trendy · Hidden = never Trendy"
                            >
                              <option value="AUTO">Auto</option>
                              <option value="PINNED">Pinned</option>
                              <option value="HIDDEN">Hidden</option>
                            </select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditItem(it)}
                            className="text-xs text-stone-300 hover:text-white h-8"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Categories */}
      {activeTab === "CATEGORIES" && (
        <Card className="border-stone-800 bg-stone-900/60">
          <CardContent className="p-0">
            {categories.length === 0 ? (
              <EmptyState title="No categories found" description="Create menu categories to organize food items." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-semibold text-xs text-white">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-xs text-stone-400">
                        {c.description || "—"}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-stone-300">
                        {c.sortOrder ?? 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.active ? "success" : "secondary"} className="text-[10px]">
                          {c.active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditCat(c)}
                          className="text-xs text-stone-300 hover:text-white h-8"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
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

      {/* TAB 3: Branch Approvals */}
      {activeTab === "APPROVALS" && (
        <div className="space-y-6">
          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white">Pending Local Menu Item Submissions</CardTitle>
              <p className="text-xs text-stone-400">Items submitted by cafe managers or franchise owners awaiting central authorization</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Submitting Cafe</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Proposed Points</TableHead>
                    <TableHead className="text-right">Review Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.items && approvals.items.length > 0 ? (
                    approvals.items.map((it: any) => (
                      <TableRow key={it._id}>
                        <TableCell className="font-semibold text-xs text-white">{it.name}</TableCell>
                        <TableCell className="text-xs text-amber-400">{it.cafe?.name || "Local Branch"}</TableCell>
                        <TableCell className="text-xs text-stone-400">{it.category?.name || "—"}</TableCell>
                        <TableCell className="text-right font-bold text-xs text-white">{it.pointsPrice} pts</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => reviewApproval("LOCAL_ITEM", it._id, true)} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500">
                              <Check className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => reviewApproval("LOCAL_ITEM", it._id, false)} className="h-7 text-xs">
                              <X className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-xs text-stone-400">
                        No pending local item requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Item Create/Edit */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Edit Menu Item: ${editingItem.name}` : "Add Central Menu Item"}</DialogTitle>
            <DialogDescription>
              Create or modify standard food catalog items and points pricing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Food Item Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hazelnut Cold Brew"
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Double shot espresso with organic hazelnut milk"
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Points Price (pts)</label>
                <Input
                  type="number"
                  value={pointsPrice}
                  onChange={(e) => setPointsPrice(Number(e.target.value))}
                  min={1}
                  required
                  className="mt-1 text-xs font-bold text-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Dietary Type</label>
                <select
                  value={isVeg ? "VEG" : "NON_VEG"}
                  onChange={(e) => setIsVeg(e.target.value === "VEG")}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="VEG">VEGETARIAN (Green)</option>
                  <option value="NON_VEG">NON-VEGETARIAN (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Image URL (Optional)</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setItemModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Menu Item
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Category Create/Edit */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? `Edit Category: ${editingCat.name}` : "Create Food Category"}</DialogTitle>
            <DialogDescription>
              Categories structure customer ordering menus and kitchen station displays.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Category Name</label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Specialty Cold Brews"
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Description</label>
              <Input
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="e.g. Steeped for 18 hours with single-origin beans"
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Sort Priority (0-999)</label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Category Status</label>
                <select
                  value={catActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => setCatActive(e.target.value === "ACTIVE")}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCatModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
