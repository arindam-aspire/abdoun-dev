import { MapPin } from "lucide-react";

export function PropertyNeighborhood() {
  return (
    <section className="mt-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm fw-bold uppercase tracking-[0.16em] text-primary">
          Neighborhood
        </p>
        <button
          type="button"
          className="text-size-11 fw-semibold text-primary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Explore Abdoun
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="relative h-52 overflow-hidden bg-surface/50">
          <div className="absolute inset-0 flex items-center justify-center text-size-xs text-charcoal/70">
            <p className="flex items-center gap-1.5 text-size-11 fw-medium text-charcoal">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Map coming soon
            </p>
          </div>
        </div>

        <div className="space-y-4 text-size-xs text-charcoal">
          <div>
            <p className="text-size-11 fw-semibold uppercase tracking-[0.18em] text-charcoal/70">
              Local highlights
            </p>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>3 minutes to Abdoun Circle</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>7 minutes to Taj Lifestyle Center</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>15 minutes to Abdali Boulevard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Easy access to airport road</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-size-11 fw-semibold uppercase tracking-[0.18em] text-charcoal/70">
              Lifestyle
            </p>
            <p className="mt-1 leading-relaxed">
              A quiet, tree-lined residential enclave with boutique cafes,
              international schools and close-knit community feel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


