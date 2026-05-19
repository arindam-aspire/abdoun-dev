"use client";

import Image, { type ImageProps } from "next/image";
import { shouldBypassNextImageOptimization } from "@/lib/images/shouldBypassNextImageOptimization";

/**
 * next/image wrapper: S3 asset URLs load directly (private bucket / presigned);
 * Pexels, Unsplash, etc. still use the default optimizer.
 */
export function AppImage({ src, unoptimized, ...props }: ImageProps) {
  const srcString = typeof src === "string" ? src.trim() : "";
  if (!srcString) {
    return null;
  }

  const bypass =
    unoptimized === true ||
    (unoptimized !== false && shouldBypassNextImageOptimization(srcString));

  return <Image {...props} src={srcString} unoptimized={bypass} />;
}
