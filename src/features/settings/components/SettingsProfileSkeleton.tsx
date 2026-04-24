import { Skeleton } from "@/components/ui/skeleton";

export function SettingsProfileSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="mt-4 h-3 w-40" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
