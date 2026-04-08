import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AuthPopupSectionProps {
  children: ReactNode;
  className?: string;
}

export function AuthPopupSection({ children, className }: AuthPopupSectionProps) {
  return <div className={cn("mt-4 flex-1 overflow-y-auto pb-1", className)}>{children}</div>;
}
