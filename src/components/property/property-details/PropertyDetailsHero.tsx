"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PropertyDetailsImageModal } from "./PropertyDetailsImageModal";
import type { DetailedProperty, HeroMediaItem } from "./types";
import { FavouriteButton } from "@/components/favourites/FavouriteButton";
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

  const mediaItems: HeroMediaItem[] = useMemo(() => {
    const items: HeroMediaItem[] = [];
    if (property.video) {
      items.push({ type: "video", url: property.video });
    }
    galleryImages.forEach((url) => items.push({ type: "image", url }));
    return items;
  }, [property.video, galleryImages]);

  /** When main shows video, gallery shows only images (no video thumb). Otherwise full media. */
  const galleryThumbItems: HeroMediaItem[] = useMemo(
    () =>
      property.video
        ? galleryImages.map((url) => ({ type: "image" as const, url }))
        : mediaItems,
    [property.video, galleryImages, mediaItems],
  );

  /** Index in mediaItems for the modal. When main is video, thumb index i = media index i+1. */
  const mediaIndexForThumb = useCallback(
    (thumbIndex: number) => (property.video ? thumbIndex + 1 : thumbIndex),
    [property.video],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const minSwipeDistance = 50;

  const hasVideo = Boolean(property.video);
  const showVideoInMain = hasVideo;

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length,
    );
  }, [mediaItems.length]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const openFullscreen = useCallback(
    (index: number) => {
      setActiveIndex(index);
      if (showVideoInMain && index === 0) {
        return;
      }
      setIsFullscreenOpen(true);
      setIsAutoPlaying(false);
    },
    [showVideoInMain],
  );

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  const toggleVideoPlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, []);

  // Auto-play (only when main area is image carousel, not when it's the single video)
  useEffect(() => {
    if (showVideoInMain || mediaItems.length <= 1 || !isAutoPlaying) return;
    const timer = window.setInterval(goToNext, 5000);
    return () => window.clearInterval(timer);
  }, [showVideoInMain, mediaItems.length, isAutoPlaying, goToNext]);

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

  // Touch / swipe (only for image carousel, not when main is video)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (showVideoInMain || !touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > minSwipeDistance) {
      goToNext();
      setIsAutoPlaying(false);
    } else if (d < -minSwipeDistance) {
      goToPrev();
      setIsAutoPlaying(false);
    }
  };

  return (
    <section
      className={`property-details-hero hero-section py-4 ${isRtl ? "hero-section--rtl" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="hero-container container mx-auto px-4 md:px-8">
        {/* ─── LEFT: Main — video only when present, else image carousel ─── */}
        <div
          className={`hero-main ${showVideoInMain ? "hero-main--video" : ""}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {showVideoInMain ? (
            <div className="hero-slide hero-slide--active hero-slide--video-wrap">
              <video
                ref={videoRef}
                src={property.video}
                className="hero-slide__img hero-slide__video"
                controls
                loop
                playsInline
                muted={false}
                preload="metadata"
                aria-label={`${property.title} video`}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              />
              {/* Center play/pause — same action as native controls */}
              <div
                className={`hero-video-play-center ${!isVideoPlaying ? "hero-video-play-center--visible" : "hero-video-play-center--hidden"}`}
                aria-hidden="true"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVideoPlayPause();
                  }}
                  className="hero-video-play-button"
                  aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                >
                  {isVideoPlaying ? (
                    <Pause className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2} />
                  ) : (
                    <Play className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Image carousel (no video case) */}
              {mediaItems.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={item.type + item.url + index}
                    className={`hero-slide ${isActive ? "hero-slide--active" : ""}`}
                    onClick={() => openFullscreen(index)}
                  >
                    <Image
                      src={item.url}
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
            </>
          )}

          {/* Soft gradient overlay — bottom-left only */}
          <div className="hero-gradient hero-gradient--left" />
          <div className="hero-gradient hero-gradient--bottom" />

          {/* ─── Badges (top-left) ─── */}
          <div className="hero-badges">
            <span className="hero-badge hero-badge--primary">
              {property.badge}
            </span>
          </div>

          <FavouriteButton
            propertyId={property.id}
            className={`absolute top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--brand-secondary)] shadow-sm ring-1 ring-[var(--border-subtle)] hover:bg-white hover:text-red-500 ${
              isRtl ? "left-4" : "right-4"
            }`}
            iconClassName="h-5 w-5"
          />

          {/* ─── Text overlay (bottom-left) ─── */}
          <div className="hero-content">
            <p className="hero-content__eyebrow">
              Abdoun Real Estate Exclusive
            </p>
            <h1 className="hero-content__title">{property.title}</h1>
            <p className="hero-content__subtitle">{property.subtitle}</p>
          </div>

          {/* ─── Navigation (bottom-right) — only for image carousel ─── */}
          {!showVideoInMain && mediaItems.length > 1 && (
            <div className="hero-nav">
              <div className="hero-dots">
                {mediaItems.map((_, i) => (
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

              <span className="hero-counter">
                {activeIndex + 1} / {mediaItems.length}
              </span>

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

        {/* ─── RIGHT: Scrollable thumbnails (images only when main is video) ─── */}
        {galleryThumbItems.length > 0 && (
          <div className="hero-thumbs">
            {galleryThumbItems.map((item, idx) => {
              const mediaIndex = mediaIndexForThumb(idx);
              return (
                <button
                  key={item.type + item.url + idx}
                  type="button"
                  data-thumb-index={idx}
                  onClick={() => {
                    goToIndex(mediaIndex);
                    setIsFullscreenOpen(true);
                    setIsAutoPlaying(false);
                  }}
                  className={`hero-thumb ${mediaIndex === activeIndex ? "hero-thumb--active" : ""}`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={item.url}
                    alt={`Property photo ${idx + 1}`}
                    fill
                    sizes="200px"
                    className="hero-thumb__img"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Mobile thumbnail strip ─── */}
      {galleryThumbItems.length > 0 && (
        <div className="hero-mobile-strip">
          {galleryThumbItems.map((item, index) => {
            const mediaIndex = mediaIndexForThumb(index);
            const isActive = mediaIndex === activeIndex;
            return (
              <button
                key={item.type + item.url + index}
                type="button"
                onClick={() => {
                  goToIndex(mediaIndex);
                  setIsFullscreenOpen(true);
                  setIsAutoPlaying(false);
                }}
                className={`hero-mobile-thumb ${isActive ? "hero-mobile-thumb--active" : ""}`}
              >
                <Image
                  src={item.url}
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
        media={mediaItems}
        activeIndex={activeIndex}
        onPrev={goToPrev}
        onNext={goToNext}
        title={property.title}
        isRtl={isRtl}
      />
    </section>
  );
}
