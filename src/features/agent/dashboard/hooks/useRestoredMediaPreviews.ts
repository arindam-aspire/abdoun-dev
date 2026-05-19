"use client";

import { useEffect, useRef } from "react";
import { getMediaPreviewCache } from "@/lib/media/mediaPreviewCache";

type MediaRef = { url: string; file_name: string };

/**
 * After reload, API `url` values are private S3 object URLs (403 in `<img>`).
 * Restore in-session blob previews from IndexedDB when this browser uploaded the file.
 */
export function useRestoredMediaPreviews(
  items: MediaRef[],
  onRestored: (storedUrl: string, blobUrl: string, fileName: string) => void,
): void {
  const onRestoredRef = useRef(onRestored);
  onRestoredRef.current = onRestored;

  const urlsKey = items.map((i) => i.url).join("\0");

  useEffect(() => {
    if (!items.length) return;
    let cancelled = false;

    void (async () => {
      for (const item of items) {
        if (cancelled || !item.url.trim()) continue;
        const cached = await getMediaPreviewCache(item.url);
        if (cancelled || !cached?.blob) continue;
        const blobUrl = URL.createObjectURL(cached.blob);
        const fileName = cached.fileName.trim() || item.file_name;
        onRestoredRef.current(item.url, blobUrl, fileName);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urlsKey, items]);
}
