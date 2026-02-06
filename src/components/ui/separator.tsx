import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className,
  orientation = "horizontal",
  ...rest
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        "shrink-0 bg-zinc-200",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
}
