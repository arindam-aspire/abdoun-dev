import { Star } from "lucide-react";

export function PropertyDetailsReviewSection() {
  return (
    <section className="rounded-3xl border border-subtle bg-white p-4 text-size-xs text-charcoal shadow-[0_10px_30px_rgba(15,23,42,0.06)] md:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" />
          <p className="text-size-11 fw-semibold uppercase tracking-[0.18em] text-charcoal/80">
            Resident reviews
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-size-11 fw-semibold text-secondary">
          4.9
          <Star className="h-3 w-3 fill-accent text-accent" />
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="rounded-xl bg-surface/75 px-3 py-2.5 ring-1 ring-subtle">
          <div className="flex items-center justify-between text-size-11 text-charcoal/80">
            <span className="fw-semibold">Building quietness</span>
            <span className="fw-semibold text-primary">4.8</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border-subtle">
            <div className="h-full w-[88%] rounded-full bg-primary" />
          </div>
        </div>

        <div className="rounded-xl bg-surface/75 px-3 py-2.5 ring-1 ring-subtle">
          <div className="flex items-center justify-between text-size-11 text-charcoal/80">
            <span className="fw-semibold">Maintenance & services</span>
            <span className="fw-semibold text-primary">4.9</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border-subtle">
            <div className="h-full w-[92%] rounded-full bg-primary" />
          </div>
        </div>

        <div className="rounded-xl bg-surface/75 px-3 py-2.5 ring-1 ring-subtle">
          <div className="flex items-center justify-between text-size-11 text-charcoal/80">
            <span className="fw-semibold">Location & access</span>
            <span className="fw-semibold text-primary">4.7</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border-subtle">
            <div className="h-full w-[86%] rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-subtle bg-white px-3 py-2.5">
        <p className="text-size-11 fw-semibold uppercase tracking-[0.18em] text-charcoal/70">
          Featured review
        </p>
        <p className="mt-1 text-size-11 leading-relaxed text-charcoal/90">
          &ldquo;We moved here two years ago and have renewed our lease twice. The
          management team handles issues the same day and the lobby feels like
          a boutique hotel.&rdquo;
        </p>
        <p className="mt-1 text-size-11 text-charcoal/60">
          - Lina K., resident since 2023
        </p>
      </div>

      <p className="mt-2 text-size-11 text-charcoal/70">
        Based on <span className="fw-semibold">27 verified reviews</span> from residents and long-term tenants.
      </p>
    </section>
  );
}



