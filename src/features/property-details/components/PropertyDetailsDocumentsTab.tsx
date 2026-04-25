"use client";

import { ExternalLink, FileText } from "lucide-react";

export interface PropertyDocumentItem {
  id: string;
  name: string;
  size: string;
  /** When set, user can open/download the file. */
  url?: string;
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
        {sections.every(
          (s) => s.items.length === 0,
        ) ? (
          <p className="text-size-sm text-[#667085]">No documents available for this listing.</p>
        ) : null}
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
                      <FileText className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-size-sm fw-semibold text-[#1f2a3d]">
                        {item.name}
                      </p>
                      {item.size ? (
                        <p className="text-size-xs text-[#667085]">{item.size}</p>
                      ) : null}
                    </div>
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-3 text-size-xs fw-semibold text-[#274b73] transition hover:bg-[#f2f4f7]"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
