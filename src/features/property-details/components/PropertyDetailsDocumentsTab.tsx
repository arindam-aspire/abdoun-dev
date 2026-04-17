"use client";

import { CircleX, FileArchive } from "lucide-react";

export interface PropertyDocumentItem {
  id: string;
  name: string;
  size: string;
}

export interface PropertyDocumentSection {
  title: string;
  items: PropertyDocumentItem[];
}

export interface PropertyDetailsDocumentsTabProps {
  sections: PropertyDocumentSection[];
}

export function PropertyDetailsDocumentsTab({
  sections,
}: PropertyDetailsDocumentsTabProps) {
  return (
    <section className="rounded-3xl border border-[#d9dee7] bg-[#f8f9fb] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-6">
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-4 text-size-sm fw-bold uppercase tracking-[0.14em] text-[#274b73]">
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[#d9dee7] bg-white px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#fff4cc] text-[#9a7a00]">
                      <FileArchive className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-size-sm fw-semibold text-[#1f2a3d]">
                        {item.name}
                      </p>
                      <p className="text-size-xs text-[#667085]">{item.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#98a2b3] transition hover:bg-[#f2f4f7] hover:text-[#667085]"
                    aria-label={`Remove ${item.name}`}
                  >
                    <CircleX className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
