"use client";

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
  if (!isOpen) return null;

  const alignmentClass = align === "right" ? "right-0" : "left-0";

  return (
    <>
      {/* Full-screen click target so clicking outside closes the dropdown */}
      <div
        className="fixed inset-0 z-30 cursor-default"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={`absolute ${alignmentClass} z-40 mt-2`}
        role="dialog"
        aria-modal="false"
      >
        {children}
      </div>
    </>
  );
}

