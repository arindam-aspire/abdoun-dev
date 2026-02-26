import type { DetailedProperty } from "./types";
import { isYouTubeUrl } from "@/lib/video";
import { Youtube } from "lucide-react";

export interface PropertyOverviewProps {
  property: DetailedProperty;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const videoLink = property.youtubeUrl ?? property.video;
  const hasYouTubeLink = isYouTubeUrl(videoLink);

  return (
    <section className="mt-8 md:mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-size-xs fw-semibold uppercase tracking-[0.18em] text-charcoal/70">
          Overview
        </p>
      </div>

      <div className="relative pl-4 border-l-2 border-primary/40 md:pl-5">
        <p className="text-size-sm leading-relaxed text-charcoal md:text-size-15">
          {property.description}
        </p>
        {hasYouTubeLink && videoLink ? (
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-secondary)] hover:underline"
          >
            <Youtube className="h-4 w-4" aria-hidden />
            Watch property video on YouTube
          </a>
        ) : null}
      </div>
    </section>
  );
}


