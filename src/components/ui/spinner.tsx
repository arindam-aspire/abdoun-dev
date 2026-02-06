import { cn } from "@/lib/cn";

export interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  "aria-label"?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({
  className,
  size = "md",
  "aria-label": ariaLabel = "Loading",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-block animate-spin rounded-full border-zinc-300 border-t-zinc-900",
        sizeClasses[size],
        className,
      )}
    />
  );
}
