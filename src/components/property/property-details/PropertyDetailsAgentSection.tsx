"use client";

import { Phone, MessageCircle, UserCircle2 } from "lucide-react";

export function PropertyDetailsAgentSection() {
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
            Listing agent
          </p>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">Jalal Yance</p>
          <p className="text-[11px] text-[var(--color-charcoal)]/70">
            Luxury specialist · Abdoun &amp; Dabouq
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand-accent)] px-3 py-2 text-xs font-semibold text-[var(--brand-on-accent)] shadow-sm hover:brightness-95"
        >
          <Phone className="h-3.5 w-3.5" />
          Book personal tour
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-3 py-2 text-xs font-semibold text-[var(--brand-on-primary)] shadow-sm hover:brightness-95"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Chat on WhatsApp
        </button>
      </div>

      <button
        type="button"
        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--brand-secondary)] px-3 py-2 text-xs font-semibold text-[var(--brand-on-primary)] hover:brightness-95"
      >
        Direct call now
      </button>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-charcoal)]/70">
        Our concierge team will confirm your viewing within{" "}
        <span className="font-semibold text-[var(--color-charcoal)]">2 hours</span> and
        share all relevant details via WhatsApp and email.
      </p>
    </section>
  );
}
