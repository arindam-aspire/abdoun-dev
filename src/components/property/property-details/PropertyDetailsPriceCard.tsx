export interface PropertyDetailsPriceCardProps {
  price: string;
}

export function PropertyDetailsPriceCard({ price }: PropertyDetailsPriceCardProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-white text-[var(--color-charcoal)] shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:text-sm">
      <div className="h-1.5 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-primary)]" />
      <div className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
          Price(JD)
        </p>
        <p className="mt-1 text-2xl font-semibold text-[var(--brand-primary)] md:text-3xl">
          {price}
        </p>
        <p className="mt-1 text-[11px] text-[var(--color-charcoal)]/70">
          Service charge on request. Flexible viewing times.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-1 text-[11px] font-medium text-[var(--brand-secondary)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
          Available for immediate viewing
        </div>
        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--brand-accent)] px-4 py-2 text-xs font-semibold text-[var(--brand-on-accent)] shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/50"
          >
            Book private tour
          </button>
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--brand-primary)] ring-1 ring-[var(--border-subtle)] hover:bg-[var(--surface)]"
          >
            Download brochure
          </button>
        </div>
      </div>
    </div>
  );
}
