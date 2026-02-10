  "use client";

import { Fragment, type ReactNode } from "react";
import { Menu, Transition } from "@headlessui/react";
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
  /** Optional alignment for the menu panel. Defaults to "right". */
  align?: "left" | "right";
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  align = "right",
}: DropdownProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex w-full justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 gap-2 items-center">
        {selected?.label ?? label}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            "absolute z-10 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none border border-zinc-100",
            align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right",
          )}
        >
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-3 py-1.5 text-left text-xs text-zinc-700",
                      active && "bg-zinc-50 text-zinc-900",
                    )}
                    onClick={() => onChange(option.value)}
                  >
                    {option.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

