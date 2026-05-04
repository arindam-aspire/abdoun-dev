import { Skeleton } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  AGENT_STATUS,
  type AgentStatusFilterValue,
} from "@/constants/agentStatus";
import { cn } from "@/lib/cn";
import { UserCheck } from "lucide-react";
import type { ReactNode } from "react";

export type AdminAgentsStatsSectionProps = {
  totalFromBuckets: number;
  activeCount: number;
  invitedCount: number;
  pendingReviewCount: number;
  declinedCount: number;
  /** True while the first summary load is in progress (no cached values yet). */
  isLoading?: boolean;
  onStatusFilter: (status: AgentStatusFilterValue) => void;
};

function StatLabel({
  isLoading,
  icon,
  children,
}: {
  isLoading: boolean;
  icon?: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) {
    return <Skeleton className="h-3.5 w-28 max-w-full" aria-hidden />;
  }
  if (icon) {
    return (
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-size-xs text-charcoal/70">{children}</p>
      </div>
    );
  }
  return <p className="text-size-xs text-charcoal/70">{children}</p>;
}

function StatMetric({
  isLoading,
  value,
  valueClassName,
}: {
  isLoading: boolean;
  value: number;
  valueClassName: string;
}) {
  if (isLoading) {
    return (
      <Skeleton
        className="mt-2 h-9 w-16 max-w-full sm:w-[4.5rem]"
        aria-hidden
      />
    );
  }
  return (
    <p className={cn("mt-2 text-size-2xl fw-semibold", valueClassName)}>
      {value}
    </p>
  );
}

export function AdminAgentsStatsSection({
  totalFromBuckets,
  activeCount,
  invitedCount,
  pendingReviewCount,
  declinedCount,
  isLoading = false,
  onStatusFilter,
}: AdminAgentsStatsSectionProps) {
  const interactiveClass = isLoading
    ? "pointer-events-none cursor-wait"
    : "cursor-pointer";
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 md:grid-cols-5"
      aria-busy={isLoading}
    >
      <Card className="rounded-xl border-subtle">
        <CardContent>
          <StatLabel isLoading={isLoading}>Total agents</StatLabel>
          <StatMetric
            isLoading={isLoading}
            value={totalFromBuckets}
            valueClassName="text-charcoal"
          />
        </CardContent>
      </Card>
      <Card
        className={cn("rounded-xl border-subtle", interactiveClass)}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-disabled={isLoading}
        onClick={() => {
          if (!isLoading) onStatusFilter(AGENT_STATUS.ACTIVE);
        }}
      >
        <CardContent>
          <StatLabel
            isLoading={isLoading}
            icon={
              !isLoading ? (
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : undefined
            }
          >
            Active agents
          </StatLabel>
          <StatMetric
            isLoading={isLoading}
            value={activeCount}
            valueClassName="text-emerald-700"
          />
        </CardContent>
      </Card>
      <Card
        className={cn("rounded-xl border-subtle", interactiveClass)}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-disabled={isLoading}
        onClick={() => {
          if (!isLoading) onStatusFilter(AGENT_STATUS.INVITED);
        }}
      >
        <CardContent>
          <StatLabel isLoading={isLoading}>Pending invites</StatLabel>
          <StatMetric
            isLoading={isLoading}
            value={invitedCount}
            valueClassName="text-amber-700"
          />
        </CardContent>
      </Card>
      <Card
        className={cn("rounded-xl border-subtle", interactiveClass)}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-disabled={isLoading}
        onClick={() => {
          if (!isLoading) onStatusFilter(AGENT_STATUS.PENDING_REVIEW);
        }}
      >
        <CardContent>
          <StatLabel isLoading={isLoading}>Pending review</StatLabel>
          <StatMetric
            isLoading={isLoading}
            value={pendingReviewCount}
            valueClassName="text-amber-700"
          />
        </CardContent>
      </Card>
      <Card
        className={cn("rounded-xl border-subtle", interactiveClass)}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-disabled={isLoading}
        onClick={() => {
          if (!isLoading) onStatusFilter(AGENT_STATUS.DECLINED);
        }}
      >
        <CardContent>
          <StatLabel isLoading={isLoading}>Declined</StatLabel>
          <StatMetric
            isLoading={isLoading}
            value={declinedCount}
            valueClassName="text-rose-700"
          />
        </CardContent>
      </Card>
    </section>
  );
}
