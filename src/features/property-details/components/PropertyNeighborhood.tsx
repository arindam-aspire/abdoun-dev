import MapEmbedIframe from "@/components/map/MapEmbedIframe";
import type { DetailedProperty } from "@/features/property-details/types";

interface PropertyNeighborhoodProps {
  property: DetailedProperty;
}

export function PropertyNeighborhood({ property }: PropertyNeighborhoodProps) {
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

      <div className="grid items-stretch gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-surface/50 md:min-h-0">
          <MapEmbedIframe
            lat={property.lat}
            lng={property.lng}
            query={property.location}
            title={`${property.title} location map`}
            height={260}
          />
        </div>

        <div className="flex h-full flex-col justify-between space-y-4 text-size-xs text-charcoal">
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
