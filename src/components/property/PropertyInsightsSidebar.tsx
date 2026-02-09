"use client";

import { useState } from "react";
import { Phone, MessageCircle, Star, UserCircle2, MapPin } from "lucide-react";
import type { Property } from "@/components/home/types";
import { PropertyCard } from "@/components/home/PropertyCard";

const SIMILAR_PROPERTIES: Property[] = [
  {
    id: 2,
    title: "Skyline Terrace Residence",
    price: "$980,000",
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1743486780771-afd09eea3624?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
    location: "Dabouq, Amman",
    beds: 3,
    baths: 4,
    area: "4,200",
  },
  {
    id: 3,
    title: "Abdoun Garden Villa",
    price: "$1,450,000",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
    location: "Abdoun, Amman",
    beds: 5,
    baths: 6,
    area: "9,100",
  },
];

export function PropertyInsightsSidebar() {
  const [activeSimilar, setActiveSimilar] = useState(0);
  const total = SIMILAR_PROPERTIES.length;
  const current = SIMILAR_PROPERTIES[activeSimilar];

  const goTo = (index: number) => {
    const next = (index + total) % total;
    setActiveSimilar(next);
  };

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Listing agent
            </p>
            <p className="text-sm font-semibold text-slate-900">Jalal Yance</p>
            <p className="text-[11px] text-slate-500">
              Luxury specialist · Abdoun &amp; Dabouq
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-600"
          >
            <Phone className="h-3.5 w-3.5" />
            Book personal tour
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Chat on WhatsApp
          </button>
        </div>

        <button
          type="button"
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
        >
          Direct call now
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Our concierge team will confirm your viewing within{" "}
          <span className="font-semibold text-slate-700">2 hours</span> and
          share all relevant details via WhatsApp and email.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Resident reviews
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            4.9
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold">Building quietness</span>
              <span className="font-semibold text-emerald-600">4.8</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[88%] rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold">Maintenance & services</span>
              <span className="font-semibold text-emerald-600">4.9</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[92%] rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold">Location & access</span>
              <span className="font-semibold text-emerald-600">4.7</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[86%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Featured review
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            “We moved here two years ago and have renewed our lease twice. The
            management team handles issues the same day and the lobby feels like
            a boutique hotel.”
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            — Lina K., resident since 2023
          </p>
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          Based on <span className="font-semibold">27 verified reviews</span>{" "}
          from residents and long-term tenants.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-sm md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-500" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Similar properties
            </p>
          </div>
          <span className="text-[11px] text-slate-500">Curated for you</span>
        </div>

        <div className="rounded-xl border border-slate-100">
          <PropertyCard property={current} agentLabel="Abdoun Real Estate" />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={() => goTo(activeSimilar - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
              aria-label="Previous similar property"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(activeSimilar + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
              aria-label="Next similar property"
            >
              ›
            </button>
            <span className="ml-1">
              {activeSimilar + 1} / {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {SIMILAR_PROPERTIES.map((property, index) => (
              <button
                key={property.id}
                type="button"
                onClick={() => setActiveSimilar(index)}
                className={`h-1.5 w-3 rounded-full transition ${
                  index === activeSimilar
                    ? "bg-sky-600"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to similar property ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}

