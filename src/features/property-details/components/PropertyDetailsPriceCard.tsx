export interface PropertyDetailsPriceCardProps {
  price: string;
  /** When area and price allow it, e.g. "250 JOD"; else hidden or "—" */
  pricePerM2?: string | null;
  documentVerificationLabel?: string;
}

export function PropertyDetailsPriceCard({
  price,
  pricePerM2,
  documentVerificationLabel = "—",
}: PropertyDetailsPriceCardProps) {
  const m2 = pricePerM2 && pricePerM2.trim().length > 0 ? pricePerM2 : "—";

  return (
    <div className="mb-4 rounded-2xl border border-subtle bg-white/95 py-5 text-charcoal shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:py-6 md:text-size-sm">
      <div className="border-l-2 border-primary pl-4 md:pl-5">
        <p className="text-size-11 fw-semibold uppercase tracking-[0.16em] text-charcoal/75">
          Price (JD)
        </p>
        <p className="mt-1 text-size-2xl fw-semibold tracking-tight text-primary md:text-size-3xl">
          {price}
        </p>
        <p className="mt-1 text-size-11 fw-medium text-charcoal/75">
          Service charge on request. Flexible viewing times.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-2.5 py-1 text-size-11 fw-semibold text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Available for immediate viewing
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-subtle px-4 pt-3 md:px-5">
        <div className="rounded-lg bg-surface/70 py-2 text-center">
          <p className="text-size-2xs fw-semibold uppercase tracking-[0.12em] text-charcoal/70">
            Avg. per m2
          </p>
          <p className="mt-0.5 text-size-xs fw-semibold text-charcoal">
            {m2}
          </p>
        </div>
        <div className="rounded-lg bg-surface/70 py-2 text-center">
          <p className="text-size-2xs fw-semibold uppercase tracking-[0.12em] text-charcoal/70">
            Document verification
          </p>
          <p
            className={
              documentVerificationLabel === "Ready" || documentVerificationLabel === "Verified"
                ? "mt-0.5 inline-flex items-center justify-center gap-1 text-size-xs fw-semibold text-emerald-700"
                : "mt-0.5 text-size-xs fw-semibold text-charcoal/80"
            }
          >
            {(documentVerificationLabel === "Ready" ||
              documentVerificationLabel === "Verified") && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
            )}
            {documentVerificationLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
