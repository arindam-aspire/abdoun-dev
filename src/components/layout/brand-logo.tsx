import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { AppLocale } from "@/i18n/routing";

interface BrandLogoProps {
  locale?: AppLocale | string;
  className?: string;
  imageClassName?: string;
  ariaLabel?: string;
  priority?: boolean;
}

export function BrandLogo({
  locale,
  className,
  imageClassName,
  ariaLabel = "Go to home page",
  priority = false,
}: BrandLogoProps) {
  const image = (
    <Image
      src="/header-logo.png"
      alt="Abdoun Real Estate"
      width={200}
      height={51}
      priority={priority}
      className={cn("h-10 w-auto", imageClassName)}
    />
  );

  if (!locale) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link
      href={`/${locale}`}
      className={cn("inline-flex items-center transition hover:opacity-90", className)}
      aria-label={ariaLabel}
    >
      {image}
    </Link>
  );
}
