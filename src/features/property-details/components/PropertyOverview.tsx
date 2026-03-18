import type { DetailedProperty } from "@/features/property-details/types";
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
        <p className="text-sm fw-bold uppercase tracking-[0.16em] text-primary">
          Overview
        </p>
      </div>

      <div className="relative rounded-xl bg-surface/65 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] md:p-5">
        <p className="border-l-2 border-primary/40 pl-4 text-size-sm fw-medium leading-relaxed text-charcoal/90 md:pl-5 md:text-size-15">
          {property.description}
        </p>
        {hasYouTubeLink && videoLink ? (
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 pl-4 text-sm font-semibold text-[var(--brand-secondary)] hover:underline md:pl-5"
          >
            <Youtube className="h-4 w-4" aria-hidden />
            Watch property video on YouTube
          </a>
        ) : null}
      </div>
    </section>
  );
}
