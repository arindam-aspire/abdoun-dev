import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop";

export function mapGallery(item: PropertyDetailsApiResponse): string[] {
  if (Array.isArray(item.images) && item.images.length > 0) return item.images;

  const mediaImages = item.media?.images;
  if (Array.isArray(mediaImages)) {
    if (typeof mediaImages[0] === "string") {
      return (mediaImages as string[]).filter((img): img is string => Boolean(img));
    }

    return (
      mediaImages as Array<{ url?: string | null; thumb_url?: string | null }>
    )
      .map((img) => img.url || img.thumb_url || "")
      .filter((img): img is string => Boolean(img));
  }

  if (item.media?.thumbnail) return [item.media.thumbnail];
  return [FALLBACK_IMAGE];
}

