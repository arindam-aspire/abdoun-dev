import { Skeleton } from "@/components/ui/skeleton";

export function SettingsFormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
