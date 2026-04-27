"use client";

import { useRef, useCallback, useState, useMemo } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/cn";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/gif,image/webp";
const MAX_IMAGE_MB = 4;

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export interface ProfilePhotoProps {
  /** Presigned GET from GET /auth/me; not upload response, not private S3 object URL. */
  profilePictureUrl?: string | null;
  /** Full name for initials fallback. */
  fullName?: string;
  /** Called when user selects a new image (data URL) — local preview only. */
  onPhotoChange?: (dataUrl: string) => void;
  /** Called when user removes the local preview / requests clear. */
  onPhotoRemove?: () => void;
  /** Re-fetch GET /auth/me (e.g. on image error / expired presigned URL). */
  onRefetchUser?: () => Promise<void>;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  /** Optional class for the wrapper. */
  className?: string;
  /** When true, show change/remove controls. Default true. */
  editable?: boolean;
  /** RTL layout. */
  isRtl?: boolean;
}

const sizeClasses = {
  sm: "h-20 w-20",
  md: "h-28 w-28",
  lg: "h-36 w-36",
};

function isDataOrBlobUrl(url: string): boolean {
  return url.startsWith("data:") || url.startsWith("blob:");
}

export function ProfilePhoto({
  profilePictureUrl,
  fullName = "",
  onPhotoChange,
  onPhotoRemove,
  onRefetchUser,
  size = "md",
  className,
  editable = true,
  isRtl = false,
}: ProfilePhotoProps) {
  const t = useTranslations("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bust, setBust] = useState(() => Date.now());

  const serverWithBust = useMemo(() => {
    if (!profilePictureUrl?.trim()) return null;
    return `${profilePictureUrl}${profilePictureUrl.includes("?") ? "&" : "?"}t=${bust}`;
  }, [profilePictureUrl, bust]);

  const displayUrl = previewUrl ?? serverWithBust;
  const initials = getInitials(fullName) || "?";

  const handleAvatarError = useCallback(async () => {
    try {
      await onRefetchUser?.();
    } catch {
      console.warn("Avatar refresh failed");
    }
    setBust(Date.now());
  }, [onRefetchUser]);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      setPhotoError(null);
      if (!file) return;
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setPhotoError(t("photoTooLarge"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        onPhotoChange?.(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [t, onPhotoChange],
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setPhotoError(null);
    onPhotoRemove?.();
  }, [onPhotoRemove]);

  return (
    <div className={cn("flex flex-col items-center", className)} dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative shrink-0">
        <div
          className={cn(
            "overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-200 ring-2 ring-white dark:border-zinc-600 dark:bg-zinc-700 dark:ring-zinc-800",
            sizeClasses[size],
          )}
          aria-hidden
        >
          {displayUrl ? (
            isDataOrBlobUrl(displayUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <Image
                src={displayUrl}
                alt="Profile"
                width={size === "lg" ? 144 : size === "md" ? 112 : 80}
                height={size === "lg" ? 144 : size === "md" ? 112 : 80}
                className="h-full w-full object-cover"
                unoptimized
                onError={handleAvatarError}
              />
            )
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-600 dark:text-zinc-300 md:text-3xl">
              {initials}
            </span>
          )}
        </div>
        {editable && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_IMAGE}
              className="hidden"
              onChange={handleSelect}
              aria-label={t("changePhoto")}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-500 text-white shadow-md",
                "hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
                "dark:border-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-500",
                isRtl && "right-auto left-0",
              )}
              aria-label={t("changePhoto")}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
          </>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {t("recommendedSize")}
      </p>
      {editable && displayUrl && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-2 text-xs font-medium text-zinc-500 underline hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 rounded dark:text-zinc-400 dark:hover:text-red-400"
        >
          {t("remove")}
        </button>
      )}
      {photoError && (
        <p className="mt-2 text-center text-xs text-red-600 dark:text-red-400" role="alert">
          {photoError}
        </p>
      )}
    </div>
  );
}
