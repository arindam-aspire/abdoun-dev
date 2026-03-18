import type { DetailedProperty } from "@/features/property-details/types";

export interface PropertyVirtualTourProps {
  property: DetailedProperty;
}

/**
 * Extracts the iframe src URL from the virtual tour value.
 * Accepts either a plain URL or pasted iframe embed code (e.g. Matterport, YouTube).
 */
const IFRAME_SRC_REGEX = /<iframe[^>]*\ssrc=["']([^"']+)["']/i;
const PLAIN_URL_REGEX = /^https?:\/\/\S+/i;

function getVirtualTourUrl(value: string | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Pasted iframe embed code: extract src attribute
  const iframeMatch = IFRAME_SRC_REGEX.exec(trimmed);
  if (iframeMatch?.[1]) {
    return iframeMatch[1].trim();
  }

  // Plain URL: must look like a valid http(s) URL
  if (PLAIN_URL_REGEX.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/** allow attribute for YouTube, Matterport, 360° and similar embeds */
const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share; xr-spatial-tracking";

export function PropertyVirtualTour({ property }: Readonly<PropertyVirtualTourProps>) {
  const url = getVirtualTourUrl(property.virtualTourUrl);

  if (!url) return null;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm fw-bold uppercase tracking-[0.16em] text-primary">
          Virtual Tour
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-surface/65 py-3 px-2 shadow-[0_2px_10px_rgba(15,23,42,0.04)] md:py-4 md:px-2">
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-subtle bg-black/5">
          <iframe
            src={url}
            title={property.title ? `${property.title} – Virtual Tour` : "Virtual tour"}
            className="h-full w-full border-0"
            loading="lazy"
            allow={IFRAME_ALLOW}
            allowFullScreen
          />
        </div>
        <p className="mt-2 text-size-11 text-charcoal/70">
          If the virtual tour does not load,{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="fw-semibold text-[var(--brand-secondary)] hover:underline"
          >
            open it in a new tab
          </a>
          {"."}
        </p>
      </div>
    </section>
  );
}
