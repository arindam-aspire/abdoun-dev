"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./PropertyDetailsImageModal.css";

export interface PropertyDetailsImageModalProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  title: string;
  isRtl?: boolean;
}

export function PropertyDetailsImageModal({
  open,
  onClose,
  images,
  activeIndex,
  onPrev,
  onNext,
  title,
  isRtl = false,
}: PropertyDetailsImageModalProps) {
  if (!open) return null;

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
        <Image
          src={images[activeIndex]}
          alt={`${title} full screen photo ${activeIndex + 1}`}
          fill
          unoptimized
          quality={100}
          sizes="100vw"
          className="property-image-modal__img"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="property-image-modal__arrow property-image-modal__arrow--prev"
              onClick={onPrev}
              aria-label="Previous photo"
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
              aria-label="Next photo"
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
