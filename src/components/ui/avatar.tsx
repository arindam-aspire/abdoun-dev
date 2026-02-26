import type { HTMLAttributes, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-size-xs",
  md: "h-10 w-10 text-size-sm",
  lg: "h-12 w-12 text-size-base",
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  ...rest
}: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : "?";

  return (
    <span
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-zinc-200 text-zinc-600 fw-medium",
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          {initials}
        </span>
      )}
    </span>
  );
}

