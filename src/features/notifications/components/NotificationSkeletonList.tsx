"use client";

type NotificationSkeletonListProps = {
  count?: number;
  ariaLabel: string;
};

export function NotificationSkeletonList({
  count = 5,
  ariaLabel,
}: NotificationSkeletonListProps) {
  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {Array.from({ length: count }).map((_, index) => (
        <li
          // eslint-disable-next-line react/no-array-index-key
          key={`notification-skeleton-${index}`}
          className="rounded-xl border border-subtle bg-white p-4"
        >
          <div className="animate-pulse">
            <div className="mb-3 h-4 w-2/5 rounded bg-zinc-200" />
            <div className="mb-2 h-3 w-full rounded bg-zinc-200" />
            <div className="mb-2 h-3 w-4/5 rounded bg-zinc-200" />
            <div className="h-3 w-1/4 rounded bg-zinc-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
