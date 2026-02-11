 "use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export interface HeroDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  align: "left" | "right";
  children: ReactNode;
}

export function HeroDropdown({
  isOpen,
  onClose,
  align,
  children,
}: HeroDropdownProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alignmentClass = align === "right" ? "right-0" : "left-0";

  return (
    <div
      ref={containerRef}
      className={`absolute ${alignmentClass} z-40 mt-2`}
      role="dialog"
      aria-modal="false"
    >
      {children}
    </div>
  );
}

