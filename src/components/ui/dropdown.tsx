  "use client";

import { Fragment, type ReactNode } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  label: ReactNode;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

export function Dropdown({ label, options, value, onChange }: DropdownProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex w-full justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 gap-2 items-center">
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm text-zinc-700",
                      active && "bg-zinc-100 text-zinc-900",
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

