import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";
import type { PropertyDocumentSection } from "@/features/property-details/components/PropertyDetailsDocumentsTab";

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").filter(Boolean).pop() || "document");
  } catch {
    return "document";
  }
}

export function buildPropertyDocumentSections(
  item: PropertyDetailsApiResponse | null,
): PropertyDocumentSection[] {
  if (!item) {
    return [];
  }
  const docs = item.media?.documents;
  if (!Array.isArray(docs) || docs.length === 0) {
    return [{ title: "Documents", items: [] }];
  }
  return [
    {
      title: "Documents",
      items: docs.map((d) => {
        const url = d.url || d.thumb_url || "";
        const name =
          (d.caption && d.caption.trim()) || (url ? filenameFromUrl(url) : "Document");
        return {
          id: `doc-${d.id}`,
          name,
          size: "",
          url: url || undefined,
        };
      }),
    },
  ];
}
