"use client";

import { Fragment, type ReactNode } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
}

export function Tabs({
  tabs,
  defaultIndex = 0,
  className,
  listClassName,
  panelClassName,
}: TabsProps) {
  return (
    <TabGroup defaultIndex={defaultIndex} className={cn("w-full", className)}>
      <TabList
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-600",
          listClassName,
        )}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            className={({ selected }) =>
              cn(
                "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                selected
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "hover:text-zinc-900",
              )
            }
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels className={cn("mt-2", panelClassName)}>
        {tabs.map((tab) => (
          <TabPanel key={tab.id} className="focus-visible:outline-none">
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}
