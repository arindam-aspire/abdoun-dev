import type { PropertyDetailsApiResponse } from "@/features/property-details/api/propertyDetails.api";

/** Used when the API has no valid image URLs (avoids `next/image` + preload with `href: ""`). */
export const PROPERTY_DETAILS_GALLERY_FALLBACK =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1800&auto=format&fit=crop";

function isNonEmptyImageUrl(s: string | null | undefined): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

export function mapGallery(item: PropertyDetailsApiResponse): string[] {
  if (Array.isArray(item.images) && item.images.length > 0) {
    const fromTop = (item.images as string[]).filter(isNonEmptyImageUrl);
    if (fromTop.length > 0) return fromTop;
  }

  const mediaImages = item.media?.images;
  if (Array.isArray(mediaImages) && mediaImages.length > 0) {
    let urls: string[];
    if (typeof mediaImages[0] === "string") {
      urls = (mediaImages as string[]).filter(isNonEmptyImageUrl);
    } else {
      urls = (
        mediaImages as Array<{ url?: string | null; thumb_url?: string | null }>
      )
        .map((img) => img.url || img.thumb_url || "")
        .filter(isNonEmptyImageUrl);
    }
    if (urls.length > 0) return urls;
  }

  if (isNonEmptyImageUrl(item.media?.thumbnail ?? null)) {
    return [item.media!.thumbnail as string];
  }
  return [PROPERTY_DETAILS_GALLERY_FALLBACK];
}

