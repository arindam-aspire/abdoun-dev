"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PropertyDetailsImageModal } from "./modals/PropertyDetailsImageModal";
import type { DetailedProperty, HeroMediaItem } from "@/features/property-details/types";
import { FavouriteButton } from "@/features/favourites/components/FavouriteButton";
import { Badge } from "@/components/ui/badge";
import "./PropertyDetailsHero.css";

export interface PropertyDetailsHeroProps {
  property: DetailedProperty;
  isRtl?: boolean;
  customActions?: React.ReactNode;
}

export function PropertyDetailsHero({
  property,
  isRtl = false,
  customActions,
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

  const galleryThumbItems: HeroMediaItem[] = useMemo(
    () =>
      property.video
        ? galleryImages.map((url) => ({ type: "image" as const, url }))
        : mediaItems,
    [property.video, galleryImages, mediaItems],
  );

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

  const visibleDotIndexes = useMemo(() => {
    const total = mediaItems.length;
    if (total <= 9) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const windowSize = 9;
    let start = Math.max(0, activeIndex - 2);
    let end = start + windowSize - 1;
    if (end >= total) {
      end = total - 1;
      start = end - windowSize + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [activeIndex, mediaItems.length]);

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

  useEffect(() => {
    if (mediaItems.length <= 1 || !isAutoPlaying) return;
    const timer = window.setInterval(() => {
      if (videoRef.current && mediaItems[activeIndex]?.type === "video") {
        videoRef.current.pause();
      }
      goToNext();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [mediaItems, activeIndex, isAutoPlaying, goToNext]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay = () => setIsAutoPlaying(false);
    const onPause = () => setIsAutoPlaying(true);
    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPause);
    return () => {
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPause);
    };
  }, []);

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
      <div className="hero-container">
        <div
          className={`hero-main group`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {mediaItems.map((item, index) => {
            const isActive = index === activeIndex;

            if (item.type === "video") {
              return (
                <div key={item.type + item.url + index} className={`hero-slide hero-slide--video-wrap ${isActive ? "hero-slide--active" : ""}`}>
                  <video
                    ref={videoRef}
                    src={item.url}
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
              );
            }

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

          <div className="hero-gradient hero-gradient--left" />
          <div className="hero-gradient hero-gradient--bottom" />

          <div className="hero-badges">
            <Badge variant="exclusive" className="hero-badge">
              {property.badge}
            </Badge>
          </div>

          {customActions ? (
            <div className={`absolute top-4 z-20 ${isRtl ? "left-4" : "right-4"}`}>
              {customActions}
            </div>
          ) : (
            <FavouriteButton
              propertyId={property.id}
              className={`absolute top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-secondary shadow-sm ring-1 ring-subtle hover:bg-white hover:text-red-500 ${
                isRtl ? "left-4" : "right-4"
              }`}
              iconClassName="h-5 w-5"
            />
          )}

          <div className="hero-content">
            <p className="hero-content__eyebrow">
              Abdoun Real Estate Exclusive
            </p>
            <h1 className="hero-content__title">{property.title}</h1>
            <p className="hero-content__subtitle">{property.subtitle}</p>
          </div>

          {mediaItems.length > 1 && (
            <>
              <button
                type="button"
                className="hero-side-arrow hero-side-arrow--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                  setIsAutoPlaying(false);
                }}
                aria-label="Previous photo"
              >
                {isRtl ? (
                  <ChevronRight className="hero-side-arrow__icon" />
                ) : (
                  <ChevronLeft className="hero-side-arrow__icon" />
                )}
              </button>
              <button
                type="button"
                className="hero-side-arrow hero-side-arrow--next"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                  setIsAutoPlaying(false);
                }}
                aria-label="Next photo"
              >
                {isRtl ? (
                  <ChevronLeft className="hero-side-arrow__icon" />
                ) : (
                  <ChevronRight className="hero-side-arrow__icon" />
                )}
              </button>
            </>
          )}

          {mediaItems.length > 1 && (
            <div className="hero-nav">
              <div className="hero-dots">
                {visibleDotIndexes.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      goToIndex(i);
                      setIsAutoPlaying(false);
                    }}
                    className={`hero-dot ${i === activeIndex ? "hero-dot--active" : ""}`}
                    aria-label={`Go to slide ${i + 1}`}
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
                  onClick={() => setIsAutoPlaying((p) => !p)}
                  aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
                >
                  {isAutoPlaying ? (
                    <Pause className="hero-arrow__icon" />
                  ) : (
                    <Play className="hero-arrow__icon" />
                  )}
                </button>
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
