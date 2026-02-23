"use client";

import { MessageCircle, Phone, UserCircle2 } from "lucide-react";

export function PropertyDetailsAgentSection() {
  return (
    <section className="border-t border-[var(--border-subtle)] bg-[var(--surface)]/50 py-5 md:py-6">
      <div className="flex items-center gap-3 px-4 md:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
            Listing agent
          </p>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">Jalal Yance</p>
          <p className="text-[11px] text-[var(--color-charcoal)]/70">
            Luxury specialist — Abdoun &amp; Dabouq
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 px-4 text-xs sm:grid-cols-2 md:px-5">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand-accent)] px-3 py-2.5 text-xs font-semibold text-[var(--brand-on-accent)] shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/50"
        >
          <Phone className="h-3.5 w-3.5" />
          Book personal tour
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand-secondary)] px-3 py-2.5 text-xs font-semibold text-[var(--brand-on-primary)] shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]/50"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Chat on WhatsApp
        </button>
      </div>

      <p className="mt-3 px-4 text-[11px] leading-relaxed text-[var(--color-charcoal)]/75 md:px-5">
        Our concierge team confirms viewing slots within
        <span className="font-semibold text-[var(--color-charcoal)]"> 2 hours</span> and
        shares all details via WhatsApp and email.
      </p>
    </section>
  );
}
