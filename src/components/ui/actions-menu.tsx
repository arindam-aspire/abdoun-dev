"use client";

import { Fragment, type ReactNode, useMemo, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { cn } from "@/lib/cn";

export type ActionsMenuItem = {
  key: string;
  label: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
  /** Extra classes always applied (e.g. text color). */
  className?: string;
  /** Classes applied only when item is focused/hovered (e.g. background). */
  hoverClassName?: string;
};

export type ActionsMenuProps = {
  /** Trigger element (usually an icon button). */
  trigger: ReactNode;
  items: ActionsMenuItem[];
  /** Alignment preference. "auto" will pick best fit based on viewport. */
  align?: "left" | "right" | "auto";
};

function getScrollParent(el: HTMLElement | null): Window | Element | null {
  if (!el) return null;
  const style = getComputedStyle(el);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;
  const isScrollable =
    overflowY === "auto" || overflowY === "scroll" || overflowX === "auto" || overflowX === "scroll";
  const overflows =
    el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  if (isScrollable && overflows) return el;
  return getScrollParent(el.parentElement);
}

function ScrollCloseEffect({
  open,
  close,
  rootRef,
}: {
  open: boolean;
  close: () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (!open) return;
    const onScroll = () => close();
    window.addEventListener("scroll", onScroll, true);
    const scrollParent = getScrollParent(rootRef.current);
    if (scrollParent && scrollParent !== window) {
      scrollParent.addEventListener("scroll", onScroll, true);
    }
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      if (scrollParent && scrollParent !== window) {
        scrollParent.removeEventListener("scroll", onScroll, true);
      }
    };
  }, [open, close, rootRef]);
  return null;
}

export function ActionsMenu({ trigger, items, align = "auto" }: ActionsMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchor = useMemo(() => {
    if (align === "left") return { to: "bottom start", gap: 8, padding: 8 } as const;
    // "right" and "auto" both prefer bottom-end; floating-ui will shift/flip to fit.
    return { to: "bottom end", gap: 8, padding: 8 } as const;
  }, [align]);

  return (
    <Menu as="div" className="relative inline-block text-left" ref={rootRef}>
      {({ open, close }) => (
        <>
          <ScrollCloseEffect open={open} close={close} rootRef={rootRef} />
          <MenuButton as={Fragment}>{trigger}</MenuButton>

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
          // Render outside overflow containers (table wrappers) so last rows aren't clipped.
          portal
          anchor={anchor}
          // Allow page/table to scroll while menu is open; menu stays anchored via floating-ui.
          modal={false}
          className={cn(
            "z-50 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none border border-zinc-100",
          )}
        >
          <div className="py-1">
            {items.map((item) => (
              <MenuItem key={item.key} disabled={item.disabled}>
                {({ focus, disabled }) => (
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-3 py-2 text-left text-size-xs cursor-pointer capitalize",
                      disabled ? "cursor-default text-zinc-400" : "text-zinc-700",
                      focus &&
                        !disabled &&
                        (item.hoverClassName ?? "bg-zinc-50 text-zinc-900"),
                      item.destructive && !disabled && "text-rose-700",
                      item.destructive && focus && !disabled && "bg-rose-50 text-rose-800",
                      item.className,
                    )}
                    onClick={() => {
                      if (disabled) return;
                      item.onSelect();
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
        </>
      )}
    </Menu>
  );
}

