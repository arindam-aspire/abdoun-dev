"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { PropertyDetailsImageModal } from "./PropertyDetailsImageModal";
import type { DetailedProperty } from "./types";
import "./PropertyDetailsHero.css";

export interface PropertyDetailsHeroProps {
  property: DetailedProperty;
  isRtl?: boolean;
}

export function PropertyDetailsHero({
  property,
  isRtl = false,
}: PropertyDetailsHeroProps) {
  const galleryImages = useMemo(
    () =>
      property.gallery && property.gallery.length > 0
        ? property.gallery
        : [property.image],
    [property.gallery, property.image],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  }, [galleryImages.length]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const openFullscreen = useCallback((index: number) => {
    setActiveIndex(index);
    setIsFullscreenOpen(true);
    setIsAutoPlaying(false);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  // Auto-play
  useEffect(() => {
    if (galleryImages.length <= 1 || !isAutoPlaying) return;
    const timer = window.setInterval(goToNext, 5000);
    return () => window.clearInterval(timer);
  }, [galleryImages.length, isAutoPlaying, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
        setIsAutoPlaying(false);
      } else if (e.key === "ArrowRight") {
        goToNext();
        setIsAutoPlaying(false);
      } else if (e.key === "Escape") {
        setIsFullscreenOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  useEffect(() => {
    if (!isFullscreenOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreenOpen]);

  // Touch / swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > minSwipeDistance) {
      goToNext();
      setIsAutoPlaying(false);
    } else if (d < -minSwipeDistance) {
      goToPrev();
      setIsAutoPlaying(false);
    }
  };

  // Three right-side thumbnails
  const sideIndexes = useMemo(() => {
    if (galleryImages.length <= 1) return [];
    const count = Math.min(3, galleryImages.length - 1);
    return Array.from({ length: count }, (_, i) => (activeIndex + 1 + i) % galleryImages.length);
  }, [activeIndex, galleryImages.length]);

  return (
    <section
      className={`property-details-hero hero-section py-4 ${isRtl ? "hero-section--rtl" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="hero-container container mx-auto px-4 md:px-8">
        {/* ─── LEFT: Main image carousel ─── */}
        <div
          className="hero-main"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Images */}
          {galleryImages.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={src + index}
                className={`hero-slide ${isActive ? "hero-slide--active" : ""}`}
                onClick={() => openFullscreen(index)}
              >
                <Image
                  src={src}
                  alt={property.title}
                  fill
                  priority={index === 0}
                  unoptimized
                  quality={100}
                  sizes="(min-width: 768px) 70vw, 100vw"
                  className="hero-slide__img"
                />
              </div>
            );
          })}

          {/* Soft gradient overlay — bottom-left only */}
          <div className="hero-gradient hero-gradient--left" />
          <div className="hero-gradient hero-gradient--bottom" />

          {/* ─── Badges (top-left) ─── */}
          <div className="hero-badges">
            <span className="hero-badge hero-badge--primary">
              {property.badge}
            </span>
            {property.status && (
              <span className="hero-badge hero-badge--secondary">
                {property.status}
              </span>
            )}
          </div>

          {/* ─── Text overlay (bottom-left) ─── */}
          <div className="hero-content">
            <p className="hero-content__eyebrow">
              Abdoun Real Estate Exclusive
            </p>
            <h1 className="hero-content__title">{property.title}</h1>
            <p className="hero-content__subtitle">{property.subtitle}</p>
            <div className="hero-content__location">
              <MapPin className="hero-content__location-icon" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* ─── Navigation (bottom-right) ─── */}
          {galleryImages.length > 1 && (
            <div className="hero-nav">
              {/* Dots */}
              <div className="hero-dots">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      goToIndex(i);
                      setIsAutoPlaying(false);
                    }}
                    className={`hero-dot ${i === activeIndex ? "hero-dot--active" : ""}`}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </div>

              {/* Counter */}
              <span className="hero-counter">
                {activeIndex + 1} / {galleryImages.length}
              </span>

              {/* Arrows */}
              <div className="hero-arrows">
                <button
                  type="button"
                  className="hero-arrow"
                  onClick={() => {
                    goToPrev();
                    setIsAutoPlaying(false);
                  }}
                  aria-label="Previous photo"
                >
                  {isRtl ? (
                    <ChevronRight className="hero-arrow__icon" />
                  ) : (
                    <ChevronLeft className="hero-arrow__icon" />
                  )}
                </button>
                <button
                  type="button"
                  className="hero-arrow"
                  onClick={() => {
                    goToNext();
                    setIsAutoPlaying(false);
                  }}
                  aria-label="Next photo"
                >
                  {isRtl ? (
                    <ChevronLeft className="hero-arrow__icon" />
                  ) : (
                    <ChevronRight className="hero-arrow__icon" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Floating thumbnails ─── */}
        {galleryImages.length > 1 && (
          <div className="hero-thumbs">
            {sideIndexes.map((idx) => (
              <button
                key={galleryImages[idx] + idx}
                type="button"
                onClick={() => {
                  openFullscreen(idx);
                }}
                className="hero-thumb"
                aria-label={`View photo ${idx + 1}`}
              >
                <Image
                  src={galleryImages[idx]}
                  alt={`Property photo ${idx + 1}`}
                  fill
                  sizes="200px"
                  className="hero-thumb__img"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Mobile thumbnail strip ─── */}
      {galleryImages.length > 1 && (
        <div className="hero-mobile-strip">
          {galleryImages.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={src + index}
                type="button"
                onClick={() => {
                  openFullscreen(index);
                }}
                className={`hero-mobile-thumb ${isActive ? "hero-mobile-thumb--active" : ""}`}
              >
                <Image
                  src={src}
                  alt={`Photo ${index + 1}`}
                  fill
                  sizes="80px"
                  className="hero-mobile-thumb__img"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}

      <PropertyDetailsImageModal
        open={isFullscreenOpen}
        onClose={closeFullscreen}
        images={galleryImages}
        activeIndex={activeIndex}
        onPrev={goToPrev}
        onNext={goToNext}
        title={property.title}
        isRtl={isRtl}
      />
    </section>
  );
}
