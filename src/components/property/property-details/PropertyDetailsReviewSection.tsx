import { Star } from "lucide-react";

export function PropertyDetailsReviewSection() {
  return (
    <section className="rounded-3xl border border-[var(--border-subtle)] bg-white p-4 text-xs text-[var(--color-charcoal)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] md:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[var(--brand-accent)]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/80">
            Resident reviews
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-accent)]/20 px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-secondary)]">
          4.9
          <Star className="h-3 w-3 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="rounded-xl bg-[var(--surface)]/75 px-3 py-2.5 ring-1 ring-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-charcoal)]/80">
            <span className="font-semibold">Building quietness</span>
            <span className="font-semibold text-[var(--brand-primary)]">4.8</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className="h-full w-[88%] rounded-full bg-[var(--brand-primary)]" />
          </div>
        </div>

        <div className="rounded-xl bg-[var(--surface)]/75 px-3 py-2.5 ring-1 ring-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-charcoal)]/80">
            <span className="font-semibold">Maintenance & services</span>
            <span className="font-semibold text-[var(--brand-primary)]">4.9</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className="h-full w-[92%] rounded-full bg-[var(--brand-primary)]" />
          </div>
        </div>

        <div className="rounded-xl bg-[var(--surface)]/75 px-3 py-2.5 ring-1 ring-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-charcoal)]/80">
            <span className="font-semibold">Location & access</span>
            <span className="font-semibold text-[var(--brand-primary)]">4.7</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className="h-full w-[86%] rounded-full bg-[var(--brand-primary)]" />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-[var(--border-subtle)] bg-white px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
          Featured review
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-charcoal)]/90">
          &ldquo;We moved here two years ago and have renewed our lease twice. The
          management team handles issues the same day and the lobby feels like
          a boutique hotel.&rdquo;
        </p>
        <p className="mt-1 text-[11px] text-[var(--color-charcoal)]/60">
          - Lina K., resident since 2023
        </p>
      </div>

      <p className="mt-2 text-[11px] text-[var(--color-charcoal)]/70">
        Based on <span className="font-semibold">27 verified reviews</span> from residents and long-term tenants.
      </p>
    </section>
  );
}
