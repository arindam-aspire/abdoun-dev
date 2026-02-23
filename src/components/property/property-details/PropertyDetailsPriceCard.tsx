export interface PropertyDetailsPriceCardProps {
  price: string;
}

export function PropertyDetailsPriceCard({ price }: PropertyDetailsPriceCardProps) {
  return (
    <div className="mb-4 bg-[var(--surface)]/50 py-5 text-[var(--color-charcoal)] md:py-6 md:text-sm">
      <div className="border-l-2 border-[var(--brand-primary)] pl-4 md:pl-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-charcoal)]/70">
          Price (JD)
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-primary)] md:text-3xl">
          {price}
        </p>
        <p className="mt-1 text-[11px] text-[var(--color-charcoal)]/70">
          Service charge on request. Flexible viewing times.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium text-[var(--brand-secondary)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
          Available for immediate viewing
        </div>
      </div>
      <div className="mt-4 flex w-full flex-col gap-2 px-4 md:px-5">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-[var(--brand-accent)] px-4 py-2.5 text-xs font-semibold text-[var(--brand-on-accent)] shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/50"
        >
          Book private tour
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[var(--brand-secondary)] hover:bg-[var(--surface)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/30"
        >
          Download brochure
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 px-4 md:px-5">
        <div className="py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-charcoal)]/65">
            Avg. per m²
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--color-charcoal)]">
            147 JD
          </p>
        </div>
        <div className="border-l border-[var(--border-subtle)] py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-charcoal)]/65">
            Document check
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--color-charcoal)]">
            Ready
          </p>
        </div>
      </div>
    </div>
  );
}
