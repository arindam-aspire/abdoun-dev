"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StickySearchWrapperProps {
  children: ReactNode;
  className?: string;
  /** Scroll threshold (px) to switch to compact padding. Defaults to 20. */
  thresholdPx?: number;
}

export function StickySearchWrapper({
  children,
  className,
  thresholdPx = 20,
}: StickySearchWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${64 + thresholdPx}px 0px 0px 0px`,
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [thresholdPx]);

  return (
    <Fragment>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none h-px w-full"
      />
      <div
        className={cn(
          "sticky top-16 z-[29] bg-white/90 backdrop-blur-md transition-[background-color] duration-300 ease-out motion-reduce:transition-none",
        )}
      >
        <div className={className}>
          <div
            className={cn(
              "transition-[padding] duration-300 ease-out will-change-[padding] motion-reduce:transition-none",
              isScrolled ? "py-4" : "py-8",
            )}
          >
            {children}
          </div>
          <div aria-hidden="true" className="border-b border-subtle" />
        </div>
      </div>
    </Fragment>
  );
}

