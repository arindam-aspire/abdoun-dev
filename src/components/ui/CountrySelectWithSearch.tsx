"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface CountryOption {
  value: string;
  label: string;
  divider?: boolean;
}

export interface CountrySelectWithSearchProps {
  value?: string;
  options: CountryOption[];
  onChange: (value: string | undefined) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  "aria-label"?: string;
  className?: string;
  iconComponent?: React.ComponentType<{
    country: string;
    label: string;
    "aria-hidden"?: boolean;
    aspectRatio?: number;
  }>;
}

function DefaultArrow({ "data-open": dataOpen }: { "data-open"?: boolean }) {
  return (
    <span
      className="PhoneInputCountrySelectArrow"
      data-open={dataOpen ? "true" : undefined}
      aria-hidden
      style={{
        display: "block",
        width: "0.3em",
        height: "0.3em",
        marginLeft: "0.35em",
        borderStyle: "solid",
        borderColor: "currentColor",
        borderTopWidth: 0,
        borderBottomWidth: "1px",
        borderLeftWidth: 0,
        borderRightWidth: "1px",
        transform: "rotate(45deg)",
        opacity: 0.45,
      }}
    />
  );
}

export function CountrySelectWithSearch({
  value,
  options,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  readOnly = false,
  name,
  "aria-label": ariaLabel,
  className,
  iconComponent: IconComponent,
}: CountrySelectWithSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const isDisabled = disabled || readOnly;

  const selectableOptions = useMemo(
    () => options.filter((o) => !o.divider),
    [options],
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return selectableOptions;
    const q = searchQuery.toLowerCase().trim();
    return selectableOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q),
    );
  }, [selectableOptions, searchQuery]);

  const selectedOption = useMemo(
    () => selectableOptions.find((o) => o.value === value),
    [selectableOptions, value],
  );

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 260),
      });
    }
  }, []);

  const openDropdown = useCallback(() => {
    if (isDisabled) return;
    setOpen(true);
    setSearchQuery("");
    updatePosition();
  }, [isDisabled, updatePosition]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearchQuery("");
    setPosition(null);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSelect = useCallback(
    (option: CountryOption) => {
      onChange(option.value === "ZZ" ? undefined : option.value);
      closeDropdown();
    },
    [onChange, closeDropdown],
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      updatePosition();
      const t = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(t);
    }
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      closeDropdown();
    };
    const handleScroll = (e: Event) => {
      // Only close when scrolling outside the dropdown (e.g. page scroll), not when scrolling the list
      if (panelRef.current?.contains(e.target as Node)) return;
      closeDropdown();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, closeDropdown]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDropdown();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeDropdown]);

  return (
    <div
      className="PhoneInputCountry"
      data-open={open ? "true" : undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn("PhoneInputCountrySelect", className)}
        onClick={openDropdown}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          zIndex: 1,
          border: 0,
          opacity: 0,
          cursor: isDisabled ? "default" : "pointer",
          background: "transparent",
        }}
      />
      {selectedOption && IconComponent && (
        <IconComponent
          country={value ?? "ZZ"}
          label={selectedOption.label}
          aria-hidden
        />
      )}
      <DefaultArrow data-open={open || undefined} />

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            className="z-50 min-w-[var(--country-dropdown-width,260px)] rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: "min(320px, 60vh)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              // Use CSS variable so panel can use it
              // @ts-expect-error CSS variable
              "--country-dropdown-width": `${position.width}px`,
            }}
            role="listbox"
            aria-label={ariaLabel}
          >
            <div className="sticky top-0 border-b border-zinc-100 bg-white px-2 pb-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className={cn(
                  "w-full rounded border border-zinc-200 px-2 py-1.5 text-size-sm outline-none",
                  "placeholder:text-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    closeDropdown();
                    e.preventDefault();
                  }
                  e.stopPropagation();
                }}
              />
            </div>
            <ul
              className="min-h-0 flex-1 overflow-y-auto py-1 text-size-sm"
              role="listbox"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-zinc-500">No countries found</li>
              ) : (
                filteredOptions.map((option) => (
                  <li key={option.divider ? "divider" : option.value || "ZZ"}>
                    {option.divider ? (
                      <span
                        className="block h-px bg-zinc-200 my-1"
                        style={{ fontSize: "1px" }}
                        aria-hidden
                      />
                    ) : (
                      <button
                        type="button"
                        role="option"
                        aria-selected={option.value === value}
                        className={cn(
                          "w-full px-3 py-2 text-left hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none",
                          option.value === value && "bg-primary/10 text-primary",
                        )}
                        onClick={() => handleSelect(option)}
                      >
                        {option.label}
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
