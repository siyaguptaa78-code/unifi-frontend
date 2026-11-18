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
import { EmptyState } from "@/components/ui/empty-state";
import {
  ScanLine,
  History,
  QrCode,
  Store,
  Clock,
  ShieldAlert,
  Search,
  Plus,
  Ban,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { formatDateTime, formatMinutes } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminVisitsPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY" | "CARDS">("ACTIVE");
  const [visits, setVisits] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [newCardStatus, setNewCardStatus] = useState<"ACTIVE" | "BLOCKED" | "LOST" | "INACTIVE">("BLOCKED");
  const [statusNote, setStatusNote] = useState("");

  // Assign card form
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cardUid, setCardUid] = useState("");
  const [cardType, setCardType] = useState<"NFC" | "RFID">("NFC");
  const [selectedCafeId, setSelectedCafeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [vRes, cRes, custRes, cafeRes] = await Promise.all([
        fetch("/api/visits?limit=50"),
        fetch("/api/cards?limit=50"),
        fetch("/api/admin/customers?limit=100"),
        fetch("/api/cafes"),
      ]);

      if (vRes.ok) {
        const vJson = await vRes.json();
        setVisits(vJson.data || []);
      }
      if (cRes.ok) {
        const cJson = await cRes.json();
        setCards(cJson.data || []);
      }
      if (custRes.ok) {
        const custJson = await custRes.json();
        setCustomers(custJson.data || []);
        if (custJson.data?.length > 0) setSelectedCustomerId(custJson.data[0]._id);
      }
      if (cafeRes.ok) {
        const cafeJson = await cafeRes.json();
        setCafes(cafeJson.data || []);
        if (cafeJson.data?.length > 0) setSelectedCafeId(cafeJson.data[0]._id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignCard = () => {
    setCardUid("");
    setCardType("NFC");
    setAssignModalOpen(true);
  };

  const handleAssignCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          uid: cardUid.trim().toUpperCase(),
          cardType,
          cafeId: selectedCafeId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to assign card");

      toast.success("RFID/NFC card successfully bound to member");
      setAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Card assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openCardStatusModal = (card: any, targetStatus: "ACTIVE" | "BLOCKED" | "LOST" | "INACTIVE") => {
    setSelectedCard(card);
    setNewCardStatus(targetStatus);
    setStatusNote(targetStatus === "LOST" ? "Customer reported lost physical card" : targetStatus === "BLOCKED" ? "Administrative security block" : "Re-activated card");
    setStatusModalOpen(true);
  };

  const handleUpdateCardStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${selectedCard._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newCardStatus,
          note: statusNote,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update card status");

      toast.success(`Card ${selectedCard.uid} moved to ${newCardStatus}`);
      setStatusModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Status update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const activeVisits = visits.filter((v) => v.status === "ACTIVE");
  const completedVisits = visits.filter((v) => v.status !== "ACTIVE");

  const filteredCards = cards.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.uid?.toLowerCase().includes(q) ||
      c.cardNumber?.toLowerCase().includes(q) ||
      c.customer?.name?.toLowerCase().includes(q) ||
      c.customer?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <PortalLayout allowedRoles={["SUPER_ADMIN"]}>
      <PageHeader
        title="Universal Visit Oversight & Hardware Card Registry"
        description="Monitor active physical check-ins across all cafes, review gate entry logs, and manage RFID/NFC cards (issue, block, report lost)."
        badge="Access Control OS"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={openAssignCard} className="text-xs h-9">
              <Plus className="h-4 w-4 mr-1.5" />
              Bind New Physical Card
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "ACTIVE" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Active Sessions ({activeVisits.length})
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "HISTORY" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          Universal Visit History ({completedVisits.length})
        </button>
        <button
          onClick={() => setActiveTab("CARDS")}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "CARDS" ? "bg-amber-600 text-stone-950" : "bg-stone-900 text-stone-400 hover:text-white"
          }`}
        >
          <QrCode className="h-3.5 w-3.5" />
          NFC/RFID Card Registry ({cards.length})
        </button>
      </div>

      {/* TAB 1: Live Active Sessions */}
      {activeTab === "ACTIVE" && (
        <Card className="border-stone-800 bg-stone-900/60">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-16 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : activeVisits.length === 0 ? (
              <EmptyState title="No active customer visits" description="No members are checked into any cafe right now." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cafe Branch</TableHead>
                    <TableHead>Card Identifier</TableHead>
                    <TableHead>Entry Timestamp</TableHead>
                    <TableHead>Session Duration</TableHead>
                    <TableHead>Gate Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVisits.map((v) => {
                    const elapsedMin = Math.round((Date.now() - new Date(v.entryAt).getTime()) / 60000);
                    return (
                      <TableRow key={v._id}>
                        <TableCell className="font-semibold text-xs text-white">
                          <div>{v.customer?.name || "Customer"}</div>
                          <div className="text-[10px] text-stone-400">{v.customer?.email}</div>
                        </TableCell>
                        <TableCell className="text-xs text-stone-200">
                          <span className="font-semibold">{v.cafe?.name}</span>
                          <span className="block font-mono text-[10px] text-amber-500">{v.cafe?.code}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-amber-400">
                          {v.cardUid || "Virtual / Code"}
                        </TableCell>
                        <TableCell className="text-xs text-stone-300">
                          {formatDateTime(v.entryAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-emerald-400">
                          {formatMinutes(elapsedMin)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="text-[10px]">
                            Inside Cafe Now
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Visit History */}
      {activeTab === "HISTORY" && (
        <Card className="border-stone-800 bg-stone-900/60">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-16 flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : completedVisits.length === 0 ? (
              <EmptyState title="No visit history logged" description="Check-in and checkout events will appear here." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Branch Location</TableHead>
                    <TableHead>Card UID</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>Exit</TableHead>
                    <TableHead className="text-right">Minutes Charged</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedVisits.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell className="font-semibold text-xs text-white">
                        <div>{v.customer?.name || "Member"}</div>
                        <div className="text-[10px] text-stone-400">{v.customer?.mobile}</div>
                      </TableCell>
                      <TableCell className="text-xs text-stone-200">
                        {v.cafe?.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-stone-400">
                        {v.cardUid || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-stone-300">{formatDateTime(v.entryAt)}</TableCell>
                      <TableCell className="text-xs text-stone-400">{v.exitAt ? formatDateTime(v.exitAt) : "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-stone-200">
                        {formatMinutes(v.minutesConsumed || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{v.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Card Registry */}
      {activeTab === "CARDS" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
              <Input
                placeholder="Search by UID, card number, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <span className="text-xs text-stone-400">Showing {filteredCards.length} cards</span>
          </div>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-16 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : filteredCards.length === 0 ? (
                <EmptyState title="No cards match search" description="Try a different query or bind a new physical card." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card Serial #</TableHead>
                      <TableHead>Hex UID</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Assigned Member</TableHead>
                      <TableHead>Issuing Branch</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead className="text-right">Hardware Controls</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell className="font-mono text-xs font-bold text-white">
                          {c.cardNumber}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-amber-500 font-bold">
                          {c.uid}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{c.cardType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-stone-200">
                          {c.customer ? (
                            <div>
                              <div className="font-medium text-white">{c.customer.name}</div>
                              <div className="text-[10px] text-stone-400">{c.customer.mobile}</div>
                            </div>
                          ) : (
                            <span className="text-stone-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-stone-400">
                          {c.assignedCafe?.name || "Global / Universal"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              c.status === "ACTIVE"
                                ? "success"
                                : c.status === "BLOCKED" || c.status === "LOST"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] text-stone-400">
                          {formatDateTime(c.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === "ACTIVE" ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openCardStatusModal(c, "LOST")}
                                  className="text-xs text-red-400 hover:text-red-300 h-8"
                                >
                                  Report Lost
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openCardStatusModal(c, "BLOCKED")}
                                  className="text-xs text-amber-400 hover:text-amber-300 h-8"
                                >
                                  Block
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openCardStatusModal(c, "ACTIVE")}
                                className="text-xs text-emerald-400 hover:text-emerald-300 h-8"
                              >
                                Re-activate
                              </Button>
                            )}
                          </div>
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

      {/* Modal 1: Bind New Card */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bind Hardware RFID / NFC Card</DialogTitle>
            <DialogDescription>
              Assign a physical card UID to an active Unifi Cafe member. Replaces any previous active physical card.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignCard} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Select Member</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                required
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.profile?.customerCode || c.mobile || c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300">Hardware Card UID (Hexadecimal)</label>
              <Input
                value={cardUid}
                onChange={(e) => setCardUid(e.target.value.toUpperCase())}
                placeholder="e.g. 04A1B2C3D4 or 7A8B9C0D"
                required
                className="mt-1 font-mono text-xs uppercase"
              />
              <p className="text-[10px] text-stone-400 mt-1">Read by physical ACR122U or ESP32 scanner</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-300">Card Technology</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  <option value="NFC">NFC (Mifare Classic / NTAG)</option>
                  <option value="RFID">RFID (13.56 MHz / 125 kHz)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-300">Issuing Branch</label>
                <select
                  value={selectedCafeId}
                  onChange={(e) => setSelectedCafeId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white"
                >
                  {cafes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Bind Card to Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Change Card Status */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hardware Security: {newCardStatus} Card</DialogTitle>
            <DialogDescription>
              Update security status for Card UID {selectedCard?.uid} ({selectedCard?.cardNumber}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCardStatus} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300">Reason / Incident Note</label>
              <Input
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Card misplaced by customer"
                required
                className="mt-1 text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={submitting} variant={newCardStatus === "ACTIVE" ? "default" : "destructive"}>
                Confirm {newCardStatus}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
