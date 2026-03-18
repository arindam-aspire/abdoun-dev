"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";
import type { HeroMediaItem } from "@/features/property-details/types";
import "./PropertyDetailsImageModal.css";

export interface PropertyDetailsImageModalProps {
  open: boolean;
  onClose: () => void;
  media: HeroMediaItem[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  title: string;
  isRtl?: boolean;
}

export function PropertyDetailsImageModal({
  open,
  onClose,
  media,
  activeIndex,
  onPrev,
  onNext,
  title,
  isRtl = false,
}: PropertyDetailsImageModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    const item = media[activeIndex];
    if (item?.type === "video") {
      videoRef.current.src = item.url;
      videoRef.current.play().catch(() => {});
    }
  }, [open, activeIndex, media]);

  if (!open) return null;

  const activeItem = media[activeIndex];
  if (!activeItem) return null;

  return (
    <div
      className={`property-image-modal ${isRtl ? "property-image-modal--rtl" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Property image viewer"
      onClick={onClose}
    >
      <button
        type="button"
        className="property-image-modal__back"
        onClick={onClose}
        aria-label="Back to gallery"
      >
        {isRtl ? (
          <ChevronRight className="property-image-modal__back-icon" />
        ) : (
          <ChevronLeft className="property-image-modal__back-icon" />
        )}
        <span>Back</span>
      </button>

      <div
        className="property-image-modal__stage"
        onClick={(e) => e.stopPropagation()}
      >
        {activeItem?.type === "video" ? (
          <video
            ref={videoRef}
            src={activeItem.url}
            className="property-image-modal__img property-image-modal__video"
            controls
            loop
            playsInline
            muted={false}
          />
        ) : (
          <Image
            src={activeItem?.url ?? ""}
            alt={`${title} full screen photo ${activeIndex + 1}`}
            fill
            unoptimized
            quality={100}
            sizes="100vw"
            className="property-image-modal__img"
            priority
          />
        )}

        {media.length > 1 && (
          <>
            <button
              type="button"
              className="property-image-modal__arrow property-image-modal__arrow--prev"
              onClick={onPrev}
              aria-label="Previous"
            >
              {isRtl ? (
                <ChevronRight className="property-image-modal__arrow-icon" />
              ) : (
                <ChevronLeft className="property-image-modal__arrow-icon" />
              )}
            </button>
            <button
              type="button"
              className="property-image-modal__arrow property-image-modal__arrow--next"
              onClick={onNext}
              aria-label="Next"
            >
              {isRtl ? (
                <ChevronLeft className="property-image-modal__arrow-icon" />
              ) : (
                <ChevronRight className="property-image-modal__arrow-icon" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
