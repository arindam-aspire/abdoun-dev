import { MapPin } from "lucide-react";

export function PropertyNeighborhood() {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Neighborhood
        </p>
        <button
          type="button"
          className="text-[11px] font-semibold text-sky-700 hover:text-sky-800"
        >
          Explore Abdoun
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="relative h-52 overflow-hidden rounded-xl bg-slate-100">
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            <div className="rounded-xl bg-white/90 px-4 py-2 shadow-sm">
              <p className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                Map coming soon
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Embed your preferred map provider here.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Local highlights
            </p>
            <ul className="mt-2 space-y-1.5">
              <li>• 3 minutes to Abdoun Circle</li>
              <li>• 7 minutes to Taj Lifestyle Center</li>
              <li>• 15 minutes to Abdali Boulevard</li>
              <li>• Easy access to airport road</li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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

