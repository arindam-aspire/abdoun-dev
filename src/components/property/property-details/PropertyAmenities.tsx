import {
  BedDouble,
  Dumbbell,
  Home,
  ShieldCheck,
  Sparkles,
  Sun,
  Trees,
  Users,
  Waves,
} from "lucide-react";

function getAmenityIcon(label: string) {
  const text = label.toLowerCase();

  if (text.includes("pool") || text.includes("plunge")) {
    return Waves;
  }
  if (text.includes("fitness") || text.includes("studio") || text.includes("gym")) {
    return Dumbbell;
  }
  if (text.includes("bedroom") || text.includes("walk-in wardrobe")) {
    return BedDouble;
  }
  if (text.includes("study") || text.includes("library")) {
    return Home;
  }
  if (text.includes("parking") || text.includes("parking bays")) {
    return Users;
  }
  if (text.includes("concierge") || text.includes("security")) {
    return ShieldCheck;
  }
  if (text.includes("windows") || text.includes("panoramic")) {
    return Sun;
  }
  if (text.includes("schools") || text.includes("embassies")) {
    return Trees;
  }

  return Sparkles;
}

export interface PropertyAmenitiesProps {
  amenities: string[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  return (
    <section className="mt-2">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm fw-bold uppercase tracking-[0.16em] text-primary">
          Features
        </p>
        {/* <p className="text-size-11 text-charcoal/70">
          Thoughtfully selected for elevated everyday living.
        </p> */}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--color-charcoal)] sm:grid-cols-3 md:grid-cols-4">
        {amenities.length === 0 && (
          <p className="col-span-full text-sm text-[var(--color-charcoal)]/70">
            No features listed for this property.
          </p>
        )}
        {amenities.map((item) => (
          <div
            key={item}
            className="group flex items-center gap-2 rounded-lg bg-surface/65 px-2 py-2 transition-colors hover:text-primary"
          >
            {(() => {
              const Icon = getAmenityIcon(item);
              return (
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              );
            })()}
            <span className="leading-snug fw-medium">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}


