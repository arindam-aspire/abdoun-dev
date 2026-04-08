import Image from "next/image";
import { cn } from "@/lib/cn";

interface AuthProviderLogoProps {
  src?: string;
  alt?: string;
  text?: string;
  className?: string;
  imageClassName?: string;
}

export function AuthProviderLogo({
  src,
  alt = "",
  text,
  className,
  imageClassName,
}: AuthProviderLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold",
        className,
      )}
      aria-hidden="true"
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={20}
          height={20}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      ) : (
        text
      )}
    </span>
  );
}

