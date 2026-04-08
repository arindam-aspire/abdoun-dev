"use client";

import type { CSSProperties, ReactNode } from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DropdownOption {
  label: ReactNode;
  value: string;
}

export interface DropdownProps {
  label: ReactNode;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  buttonId?: string;
  /** Extra class for the root wrapper element. */
  className?: string;
  /** Optional alignment for the menu panel. Defaults to "right". */
  align?: "left" | "right";
  /** Where to open the menu. Defaults to "auto" (opens upward if needed). */
  placement?: "auto" | "top" | "bottom";
  /** Cursor style for the trigger button. Defaults to "pointer". */
  cursor?: "pointer" | "default";
  /** Extra class for the trigger button. */
  buttonClassName?: string;
  /** Inline styles for the trigger button (e.g. width/height). */
  buttonStyle?: CSSProperties;
  /** Extra class for the menu panel (e.g. width). */
  menuClassName?: string;
  /** Inline styles for the menu panel (e.g. width/maxHeight). */
  menuStyle?: CSSProperties;
  /** Extra class for each option button. */
  optionClassName?: string;
}

type DropdownInnerProps = {
  open: boolean;
  label: ReactNode;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  buttonId?: string;
  className?: string;
  align: "left" | "right";
  placement: "auto" | "top" | "bottom";
  cursor: "pointer" | "default";
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  menuClassName?: string;
  menuStyle?: CSSProperties;
  optionClassName?: string;
};

function DropdownInner({
  open,
  label,
  options,
  value,
  onChange,
  buttonId,
  className,
  align,
  placement,
  cursor,
  buttonClassName,
  buttonStyle,
  menuClassName,
  menuStyle,
  optionClassName,
}: DropdownInnerProps) {
  const selected = options.find((option) => option.value === value);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState<"top" | "bottom">(
    placement === "top" ? "top" : "bottom",
  );

  const alignmentClass = useMemo(
    () =>
      align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right",
    [align],
  );

  useEffect(() => {
    if (!open) return;

    if (placement !== "auto") {
      setResolvedPlacement(placement === "top" ? "top" : "bottom");
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      const btn = buttonRef.current;
      const menu = menuRef.current;
      if (!btn || !menu) return;

      const btnRect = btn.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();

      const spaceBelow = window.innerHeight - btnRect.bottom;
      const spaceAbove = btnRect.top;
      const wantsTop =
        spaceBelow < menuRect.height + 12 && spaceAbove > menuRect.height + 12;
      setResolvedPlacement(wantsTop ? "top" : "bottom");
    });

    return () => window.cancelAnimationFrame(raf);
  }, [open, placement]);

  return (
    <>
      <MenuButton
        ref={buttonRef}
        id={buttonId}
        suppressHydrationWarning
        className={cn(
          "inline-flex w-full justify-center rounded-full border outline-none bg-white px-4 py-2 text-xs fw-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 gap-2 items-center",
          cursor === "pointer" ? "cursor-pointer" : "cursor-default",
          buttonClassName,
        )}
        style={buttonStyle}
      >
        {selected?.label ?? label}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          ref={menuRef}
          className={cn(
            "absolute z-50 w-44 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none border border-zinc-100",
            alignmentClass,
            resolvedPlacement === "top"
              ? "bottom-full mb-2 origin-bottom-right"
              : "top-full mt-2 origin-top-right",
            menuClassName,
          )}
          style={menuStyle}
        >
          <div className="py-1">
            {options.map((option) => (
              <MenuItem key={option.value}>
                {({ focus }) => (
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-3 py-1.5 text-left text-xs text-zinc-700 cursor-pointer",
                      focus && "bg-zinc-50 text-zinc-900",
                      optionClassName,
                    )}
                    onClick={() => onChange(option.value)}
                  >
                    {option.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </>
  );
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  buttonId,
  className,
  align = "right",
  placement = "auto",
  cursor = "pointer",
  buttonClassName,
  buttonStyle,
  menuClassName,
  menuStyle,
  optionClassName,
}: DropdownProps) {
  return (
    <Menu as="div" className={cn("relative inline-block text-left", className)}>
      {({ open }) => (
        <DropdownInner
          open={open}
          label={label}
          options={options}
          value={value}
          onChange={onChange}
          buttonId={buttonId}
          className={className}
          align={align}
          placement={placement}
          cursor={cursor}
          buttonClassName={buttonClassName}
          buttonStyle={buttonStyle}
          menuClassName={menuClassName}
          menuStyle={menuStyle}
          optionClassName={optionClassName}
        />
      )}
    </Menu>
  );
}
