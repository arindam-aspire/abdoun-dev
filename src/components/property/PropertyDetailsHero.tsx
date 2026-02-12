"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { DetailedProperty } from "./types";

export interface PropertyDetailsHeroProps {
  property: DetailedProperty;
}

export function PropertyDetailsHero({
  property,
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

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
    <section className="hero-section py-4">
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
              >
                <Image
                  src={src}
                  alt={property.title}
                  fill
                  priority={index === 0}
                  unoptimized
                  quality={90}
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
                  <ChevronLeft className="hero-arrow__icon" />
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
                  <ChevronRight className="hero-arrow__icon" />
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
                  goToIndex(idx);
                  setIsAutoPlaying(false);
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
                  goToIndex(index);
                  setIsAutoPlaying(false);
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

      {/* ─── Scoped styles ─── */}
      <style jsx>{`
        /* ── Section ── */
        .hero-section {
          position: relative;
        }

        /* ── Container: main + thumbs ── */
        .hero-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .hero-container {
            flex-direction: row;
            gap: 20px;
            height: 78vh;
            max-height: 720px;
            min-height: 480px;
          }
        }

        /* ── Main image area ── */
        .hero-main {
          position: relative;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          border-radius: 24px;
          background: #0f172a;
          aspect-ratio: 16 / 10;
        }

        @media (min-width: 768px) {
          .hero-main {
            aspect-ratio: unset;
            height: 100%;
          }
        }

        /* ── Slides ── */
        .hero-slide {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0;
          transform: scale(1.03);
          transition:
            opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-slide--active {
          opacity: 1;
          transform: scale(1);
          z-index: 2;
        }

        .hero-slide__img {
          object-fit: cover;
          object-position: center;
        }

        /* ── Gradients ── */
        .hero-gradient {
          position: absolute;
          pointer-events: none;
          z-index: 3;
        }

        .hero-gradient--left {
          inset: 0;
          width: 60%;
          background: linear-gradient(
            to right,
            rgba(15, 23, 42, 0.75) 0%,
            rgba(15, 23, 42, 0.35) 45%,
            transparent 100%
          );
        }

        .hero-gradient--bottom {
          bottom: 0;
          left: 0;
          right: 0;
          height: 55%;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.65) 0%,
            rgba(15, 23, 42, 0.2) 50%,
            transparent 100%
          );
        }

        /* ── Badges ── */
        .hero-badges {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 5;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          pointer-events: none;
        }

        @media (min-width: 768px) {
          .hero-badges {
            top: 28px;
            left: 28px;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          border-radius: 100px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .hero-badge--primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          box-shadow:
            0 4px 14px rgba(16, 185, 129, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        .hero-badge--secondary {
          background: rgba(15, 23, 42, 0.75);
          color: #7dd3fc;
          box-shadow:
            0 4px 14px rgba(15, 23, 42, 0.2),
            inset 0 0 0 1px rgba(56, 189, 248, 0.25);
        }

        /* ── Content overlay ── */
        .hero-content {
          position: absolute;
          bottom: 24px;
          left: 24px;
          right: 140px;
          z-index: 5;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        @media (min-width: 768px) {
          .hero-content {
            bottom: 36px;
            left: 36px;
            right: 220px;
            gap: 8px;
          }
        }

        .hero-content__eyebrow {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #7dd3fc;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
        }

        @media (min-width: 768px) {
          .hero-content__eyebrow {
            font-size: 11px;
          }
        }

        .hero-content__title {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #fff;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
          text-wrap: balance;
        }

        @media (min-width: 640px) {
          .hero-content__title {
            font-size: 32px;
          }
        }

        @media (min-width: 768px) {
          .hero-content__title {
            font-size: 40px;
          }
        }

        .hero-content__subtitle {
          font-size: 13px;
          color: rgba(241, 245, 249, 0.9);
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
          line-height: 1.5;
        }

        @media (min-width: 768px) {
          .hero-content__subtitle {
            font-size: 15px;
          }
        }

        .hero-content__location {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          font-size: 12px;
          color: rgba(241, 245, 249, 0.85);
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
        }

        .hero-content__location-icon {
          width: 14px;
          height: 14px;
          color: #38bdf8;
          flex-shrink: 0;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
        }

        /* ── Navigation cluster (bottom-right) ── */
        .hero-nav {
          position: absolute;
          bottom: 24px;
          right: 24px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 14px;
          border-radius: 100px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.15),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        @media (min-width: 768px) {
          .hero-nav {
            bottom: 36px;
            right: 36px;
            gap: 14px;
            padding: 10px 18px;
          }
        }

        /* Dots */
        .hero-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 100px;
          border: none;
          padding: 0;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.35);
          transition: all 0.4s ease;
        }

        .hero-dot--active {
          width: 22px;
          background: #38bdf8;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        }

        .hero-dot:hover:not(.hero-dot--active) {
          background: rgba(255, 255, 255, 0.55);
        }

        /* Counter */
        .hero-counter {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.04em;
        }

        /* Arrows */
        .hero-arrows {
          display: flex;
          gap: 4px;
        }

        .hero-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          transition: all 0.25s ease;
        }

        .hero-arrow:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: scale(1.08);
        }

        .hero-arrow:active {
          transform: scale(0.94);
        }

        .hero-arrow__icon {
          width: 16px;
          height: 16px;
        }

        /* ── Right-side floating thumbnails (desktop) ── */
        .hero-thumbs {
          display: none;
        }

        @media (min-width: 768px) {
          .hero-thumbs {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 200px;
            flex-shrink: 0;
          }
        }

        @media (min-width: 1024px) {
          .hero-thumbs {
            width: 220px;
            gap: 18px;
          }
        }

        .hero-thumb {
          position: relative;
          flex: 1;
          min-height: 0;
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: 18px;
          overflow: hidden;
          box-shadow:
            0 4px 20px rgba(15, 23, 42, 0.1),
            0 1px 3px rgba(15, 23, 42, 0.06);
          transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-thumb:hover {
          transform: translateY(-4px);
          box-shadow:
            0 12px 36px rgba(15, 23, 42, 0.16),
            0 2px 6px rgba(15, 23, 42, 0.08);
        }

        .hero-thumb:active {
          transform: translateY(-1px) scale(0.98);
        }

        .hero-thumb__img {
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-thumb:hover .hero-thumb__img {
          transform: scale(1.06);
        }

        /* ── Mobile thumbnail strip ── */
        .hero-mobile-strip {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 8px 16px 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .hero-mobile-strip::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 768px) {
          .hero-mobile-strip {
            display: none;
          }
        }

        .hero-mobile-thumb {
          position: relative;
          flex-shrink: 0;
          width: 76px;
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid transparent;
          padding: 0;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
          transition: all 0.3s ease;
        }

        .hero-mobile-thumb--active {
          border-color: #38bdf8;
          box-shadow:
            0 0 0 2px rgba(56, 189, 248, 0.3),
            0 4px 12px rgba(56, 189, 248, 0.15);
        }

        .hero-mobile-thumb__img {
          object-fit: cover;
        }
      `}</style>
    </section>
  );
}
