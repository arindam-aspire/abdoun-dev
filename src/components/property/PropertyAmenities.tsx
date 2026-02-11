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
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          World-class amenities
        </p>
        <p className="text-[11px] text-slate-500">
          Thoughtfully selected for elevated everyday living.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-3 md:grid-cols-4">
        {amenities.map((item) => (
          <div
            key={item}
            className="group flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-sky-50/70 hover:ring-sky-100"
          >
            {(() => {
              const Icon = getAmenityIcon(item);
              return (
                <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Icon className="h-3.5 w-3.5" />
                </span>
              );
            })()}
            <span className="leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

