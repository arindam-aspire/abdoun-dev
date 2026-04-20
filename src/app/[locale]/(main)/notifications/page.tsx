"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Bell, CheckCheck, CircleAlert, CircleCheckBig, Info } from "lucide-react";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

type NotificationLevel = "info" | "success" | "warning";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  level: NotificationLevel;
};

const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "New Property Match",
    message: "A new 3-bedroom apartment in Abdoun matches your saved search.",
    time: "2 minutes ago",
    read: false,
    level: "info",
  },
  {
    id: 2,
    title: "Viewing Confirmed",
    message: "Your property viewing request for Ref #10452 is confirmed for tomorrow at 5:00 PM.",
    time: "1 hour ago",
    read: false,
    level: "success",
  },
  {
    id: 3,
    title: "Price Updated",
    message: "A property in your favorites has a new price. Tap to view details.",
    time: "Yesterday",
    read: true,
    level: "warning",
  },
  {
    id: 4,
    title: "Account Security",
    message: "Your account was accessed from a new device. If this wasn't you, update your password.",
    time: "2 days ago",
    read: true,
    level: "warning",
  },
];

function levelIcon(level: NotificationLevel) {
  if (level === "success") return CircleCheckBig;
  if (level === "warning") return CircleAlert;
  return Info;
}

export default function NotificationsPage() {
  const locale = useLocale() as AppLocale;
  const isRtl = locale === "ar";

  const unreadCount = useMemo(
    () => DUMMY_NOTIFICATIONS.filter((n) => !n.read).length,
    [],
  );

  return (
    <div
      className="mx-auto container w-full px-4 py-8 md:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal md:text-2xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Stay updated with saved searches, property activity, and account alerts.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-subtle bg-white px-3 py-2 text-sm text-zinc-700">
          <CheckCheck className="h-4 w-4 text-emerald-600" />
          <span>{unreadCount} unread</span>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-subtle md:p-5">
        <ul className="space-y-3" aria-label="Notifications list">
          {DUMMY_NOTIFICATIONS.map((item) => {
            const Icon = levelIcon(item.level);

            return (
              <li
                key={item.id}
                className={cn(
                  "rounded-xl border p-4 transition",
                  item.read
                    ? "border-subtle bg-white"
                    : "border-blue-200 bg-blue-50/50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 rounded-full p-1.5",
                        item.level === "success" && "bg-emerald-100 text-emerald-700",
                        item.level === "warning" && "bg-amber-100 text-amber-700",
                        item.level === "info" && "bg-blue-100 text-blue-700",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {item.message}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">{item.time}</p>
                    </div>
                  </div>

                  {!item.read && (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {DUMMY_NOTIFICATIONS.length === 0 && (
          <div className="py-10 text-center text-zinc-500">
            <Bell className="mx-auto mb-3 h-7 w-7 text-zinc-400" />
            <p>No notifications yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
