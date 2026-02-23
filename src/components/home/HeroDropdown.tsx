"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode, CSSProperties, MouseEvent } from "react";

export interface HeroDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  align: "left" | "right";
  children: ReactNode;
  /** Close dropdown when a selectable option inside it is clicked. */
  closeOnSelect?: boolean;
  /**
   * When provided, the dropdown is portaled to body and positioned via this ref.
   * Use this when the dropdown would otherwise be clipped by parent overflow.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Render into body when using anchorRef. Disable to keep menu in normal layout flow. */
  portaled?: boolean;
}

export function HeroDropdown({
  isOpen,
  onClose,
  align,
  children,
  closeOnSelect = false,
  anchorRef,
  portaled = true,
}: HeroDropdownProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
    width?: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !portaled || !anchorRef?.current || typeof document === "undefined") return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        width: rect.width,
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
  }, [isOpen, align, anchorRef, portaled]);

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

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnSelect) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    // Close when clicking actionable list items, but keep editable inputs open.
    if (target.closest("button,[role='option'],[data-dropdown-option='true']")) {
      onClose();
    }
  };

  const panel = (
    <div
      ref={containerRef}
      className={`absolute ${alignmentClass} z-[9999] mt-2`}
      role="dialog"
      aria-modal="false"
      onClick={handlePanelClick}
    >
      {children}
    </div>
  );

  // When anchorRef provided, wait for position (avoids clipped flash)
  if (portaled && anchorRef && !position) return null;

  // Portal when anchorRef provided (avoids overflow clipping)
  if (portaled && anchorRef && typeof document !== "undefined" && position) {
    const style: CSSProperties = {
      top: position.top,
      width: position.width,
      minWidth: position.width,
    };
    if (position.left != null) style.left = position.left;
    if (position.right != null) style.right = position.right;
    return createPortal(
      <div
        ref={containerRef}
        className="fixed z-[9999]"
        style={style}
        role="dialog"
        aria-modal="false"
        onClick={handlePanelClick}
      >
        {children}
      </div>,
      document.body,
    );
  }

  return panel;
}

