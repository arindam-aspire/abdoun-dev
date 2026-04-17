import type { DetailedProperty } from "@/features/property-details/types";
import { isYouTubeUrl } from "@/lib/video";
import { Play } from "lucide-react";

export interface PropertyOverviewProps {
  overview: {
    title: string;
    description: string[];
    media: {
      video_label: string;
      platform: string;
      video_link: string;
    };
  };
}

export function PropertyOverview({ overview }: PropertyOverviewProps) {
  const videoLink = overview.media.platform === "YouTube" ? overview.media.video_link : null;
  const hasYouTubeLink = videoLink ? isYouTubeUrl(videoLink) : false;

  return (
    <section className="mt-7 md:mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm fw-bold uppercase tracking-[0.14em] text-[#274b73]">
          Overview
        </p>
      </div>

      <div className="relative rounded-2xl border border-[#d9dee7] bg-[#f8f9fb] p-5 md:p-6">
        <div className="whitespace-pre-line border-l-[3px] border-[#2f4f74] pl-4 text-size-sm fw-medium leading-relaxed text-[#1b2b41]/90 md:pl-5">
          {overview.description.map((description, index) => (
            <p key={index} className="mb-2">{description}</p>
          ))}
        </div>
        {hasYouTubeLink && videoLink ? (
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 pl-4 text-size-sm fw-medium text-[#274b73] hover:underline md:pl-5"
          >
            <Play className="h-4 w-4" aria-hidden />
            Watch property video on YouTube
          </a>
        ) : null}
      </div>
    </section>
  );
}
