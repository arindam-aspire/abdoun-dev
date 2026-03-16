/**
 * Agent list status values from the API.
 * Use these constants instead of hardcoding status strings.
 */
export const AGENT_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  DECLINED: "DECLINED",
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
} as const;

export type AgentStatusValue =
  | (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS];

export const AGENT_STATUS_VALUES: readonly AgentStatusValue[] = [
  AGENT_STATUS.PENDING_REVIEW,
  AGENT_STATUS.DECLINED,
  AGENT_STATUS.INVITED,
  AGENT_STATUS.ACTIVE,
];

export type AgentStatusFilterValue = "all" | AgentStatusValue;

const STATUS_CONFIG: Record<
  AgentStatusValue,
  { label: string; className: string }
> = {
  [AGENT_STATUS.PENDING_REVIEW]: {
    label: "Pending review",
    className:
      "border border-amber-200 bg-amber-50 text-amber-700",
  },
  [AGENT_STATUS.DECLINED]: {
    label: "Declined",
    className: "border border-rose-200 bg-rose-50 text-rose-700",
  },
  [AGENT_STATUS.INVITED]: {
    label: "Invited",
    className: "border border-blue-200 bg-blue-50 text-blue-700",
  },
  [AGENT_STATUS.ACTIVE]: {
    label: "Active",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function getAgentStatusLabel(status: string): string {
  const normalized = normalizeAgentStatus(status);
  return STATUS_CONFIG[normalized]?.label ?? status;
}

export function getAgentStatusClass(status: string): string {
  const normalized = normalizeAgentStatus(status);
  return STATUS_CONFIG[normalized]?.className ?? STATUS_CONFIG[AGENT_STATUS.INVITED].className;
}

/**
 * Normalize API status (e.g. "PENDING_REVIEW", "pending_review") to AgentStatusValue.
 */
export function normalizeAgentStatus(raw: string | undefined): AgentStatusValue {
  const upper = (raw ?? "").trim().toUpperCase().replace(/-/g, "_");
  if (AGENT_STATUS_VALUES.includes(upper as AgentStatusValue)) {
    return upper as AgentStatusValue;
  }
  return AGENT_STATUS.INVITED;
}

/** Options for the status filter dropdown (All + each status). */
export const AGENT_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: AgentStatusFilterValue;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: AGENT_STATUS.ACTIVE, label: STATUS_CONFIG[AGENT_STATUS.ACTIVE].label },
  { value: AGENT_STATUS.INVITED, label: STATUS_CONFIG[AGENT_STATUS.INVITED].label },
  {
    value: AGENT_STATUS.PENDING_REVIEW,
    label: STATUS_CONFIG[AGENT_STATUS.PENDING_REVIEW].label,
  },
  { value: AGENT_STATUS.DECLINED, label: STATUS_CONFIG[AGENT_STATUS.DECLINED].label },
];
