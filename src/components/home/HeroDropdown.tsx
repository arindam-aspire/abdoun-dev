"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export interface HeroDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  align: "left" | "right";
  children: ReactNode;
  /**
   * When provided, the dropdown is portaled to body and positioned via this ref.
   * Use this when the dropdown would otherwise be clipped by parent overflow.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function HeroDropdown({
  isOpen,
  onClose,
  align,
  children,
  anchorRef,
}: HeroDropdownProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left?: number; right?: number } | null>(null);

  useEffect(() => {
    if (!isOpen || !anchorRef?.current || typeof document === "undefined") return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        ...(align === "left"
          ? { left: rect.left }
          : { right: window.innerWidth - rect.right }),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, align, anchorRef]);

  useEffect(() => {
    if (!isOpen) setPosition(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inPanel = containerRef.current?.contains(target);
      const inAnchor = anchorRef?.current?.contains(target);
      if (!inPanel && !inAnchor) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const alignmentClass = align === "right" ? "right-0" : "left-0";

  const panel = (
    <div
      ref={containerRef}
      className={`absolute ${alignmentClass} z-[9999] mt-2`}
      role="dialog"
      aria-modal="false"
    >
      {children}
    </div>
  );

  // When anchorRef provided, wait for position (avoids clipped flash)
  if (anchorRef && !position) return null;

  // Portal when anchorRef provided (avoids overflow clipping)
  if (anchorRef && typeof document !== "undefined" && position) {
    return createPortal(
      <div
        ref={containerRef}
        className="fixed z-[9999]"
        style={{
          top: position.top,
          left: position.left,
          right: position.right,
        }}
        role="dialog"
        aria-modal="false"
      >
        {children}
      </div>,
      document.body,
    );
  }

  return panel;
}

