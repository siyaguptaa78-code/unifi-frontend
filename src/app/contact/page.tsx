"use client";

import React, { useState } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you for reaching out! Our support team will get in touch shortly.");
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 py-12 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Support & Inquiries
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Get in Touch
            </h1>
            <p className="mt-4 text-stone-300 text-xs sm:text-sm">
              Have questions regarding your membership, RFID card, or corporate partnership? We&apos;re here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-stone-400 uppercase tracking-wider">Email Support</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">support@unicafe.demo</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-stone-400 uppercase tracking-wider">Customer Care</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">+91 80 4000 8899</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-stone-400 uppercase tracking-wider">Corporate Headquarters</h4>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      Indiranagar 100ft Road, HAL 2nd Stage, Bengaluru, KA 560038
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-stone-800 bg-stone-900/60 p-6">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Your Name" placeholder="Sneha Roy" required />
                  <Input label="Email Address" type="email" placeholder="sneha@example.com" required />
                  <Input label="Contact Number" type="tel" placeholder="9876543210" required />
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Message / Inquiry Details
                    </label>
                    <textarea
                      rows={4}
                      className="flex w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      placeholder="How can we assist you?"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full font-semibold">
                    Send Message
                  </Button>
                </form>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Message Dispatched</h4>
                  <p className="text-xs text-stone-300">
                    A support ticket has been created. A concierge will respond to your email within 4 business hours.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

