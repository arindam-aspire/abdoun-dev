"use client";

import Link from "next/link";

export interface AboutUsSectionProps {
  title: string;
  content: string;
  seeMoreLabel?: string;
  seeMoreHref?: string;
  isRtl?: boolean;
}

export function AboutUsSection({
  title,
  content,
  seeMoreLabel,
  seeMoreHref,
  isRtl,
}: AboutUsSectionProps) {
  return (
    <section className="bg-surface border-t border-subtle">
      <div className="container mx-auto px-4 py-10 md:px-8 md:py-10">
        <header
          className={`mx-auto ${
            isRtl ? "md:text-right" : "md:text-left"
          }`}
        >
          <h2 className="text-size-2xl fw-semibold leading-tight text-secondary md:text-size-3xl md:leading-snug">
            {title}
          </h2>
          <p
            className={`mt-4 text-size-sm leading-relaxed text-[rgba(51,51,51,0.8)] md:text-size-base ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            {content}
          </p>
          {seeMoreLabel && seeMoreHref && (
            <Link
              href={seeMoreHref}
              className="mt-6 inline-flex items-center rounded-full bg-secondary px-5 py-2.5 text-size-sm fw-medium text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              {seeMoreLabel}
            </Link>
          )}
        </header>
      </div>
    </section>
  );
}


