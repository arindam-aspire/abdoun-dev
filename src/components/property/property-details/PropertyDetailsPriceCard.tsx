export interface PropertyDetailsPriceCardProps {
  price: string;
}

export function PropertyDetailsPriceCard({ price }: PropertyDetailsPriceCardProps) {
  return (
    <div className="mb-4 bg-surface/50 py-5 text-charcoal md:py-6 md:text-size-sm">
      <div className="border-l-2 border-primary pl-4 md:pl-5">
        <p className="text-size-11 fw-semibold uppercase tracking-[0.18em] text-charcoal/70">
          Price (JD)
        </p>
        <p className="mt-1 text-size-2xl fw-semibold tracking-tight text-primary md:text-size-3xl">
          {price}
        </p>
        <p className="mt-1 text-size-11 text-charcoal/70">
          Service charge on request. Flexible viewing times.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-size-11 fw-medium text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Available for immediate viewing
        </div>
      </div>
      {/* <div className="mt-4 flex w-full flex-col gap-2 px-4 md:px-5">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-size-xs fw-semibold text-on-accent shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-50"
        >
          Book private tour
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-size-xs fw-semibold text-secondary hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Download brochure
        </button>
      </div> */}
      <div className="mt-4 grid grid-cols-2 gap-3 px-4 md:px-5">
        <div className="py-2 text-center">
          <p className="text-size-2xs uppercase tracking-[0.12em] text-charcoal/65">
            Avg. per m²
          </p>
          <p className="mt-0.5 text-size-xs fw-semibold text-charcoal">
            147 JD
          </p>
        </div>
        <div className="border-l border-subtle py-2 text-center">
          <p className="text-size-2xs uppercase tracking-[0.12em] text-charcoal/65">
            Document check
          </p>
          <p className="mt-0.5 text-size-xs fw-semibold text-charcoal">
            Ready
          </p>
        </div>
      </div>
    </div>
  );
}



