"use client";

import { AdminAgentActionsMenu } from "@/features/admin-agents/components/AdminAgentActionsMenu";
import { AdminAgentsStatsSection } from "@/features/admin-agents/components/AdminAgentsStatsSection";
import { ManualAgentInputForm } from "@/features/admin-agents/components/ManualAgentInputForm";
import {
  Button,
  ConfirmDialog,
  CustomTable,
  Dropdown,
  IconButton,
  Input,
  Skeleton,
  sortRowsByConfig,
  Toast,
} from "@/components/ui";
import { CountryFlagImg } from "@/components/ui/phone-country-code-select";
import type { CustomTableColumn, SortConfig } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_PAGINATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
} from "@/components/ui/Pagination";
import type { AdminAgent } from "@/services/adminAgentApiService";
import {
  AGENT_STATUS,
  AGENT_STATUS_FILTER_OPTIONS,
  getAgentStatusClass,
  getAgentStatusLabel,
  normalizeAgentStatus,
  type AgentStatusFilterValue,
} from "@/constants/agentStatus";
import {
  clearInviteFeedback,
  createAdminAgentManually,
  fetchAdminAgents,
  fetchAdminAgentsSummary,
  inviteAdminAgentByEmail,
} from "@/features/admin-agents/adminAgentsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import type { AppLocale } from "@/i18n/routing";
import { getApiErrorMessage } from "@/lib/http";
import { getProfilePhoneReadonlyDisplay } from "@/lib/phone";
import { selectCurrentUser } from "@/store/selectors";
import { Check, Copy, Mail, UserPlus2, Users, X } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

/** Match API casing: treat status as active when lowercased value is `active`. */
function isAgentActiveForActivityColumn(status: string | undefined): boolean {
  return (status ?? "").trim().toLowerCase() === "active";
}

function getAgentActivityDateValue(agent: AdminAgent): string | undefined {
  if (isAgentActiveForActivityColumn(agent.status)) {
    const r = agent.reviewedAt != null ? String(agent.reviewedAt).trim() : "";
    return r || undefined;
  }
  const i = agent.invitedAt?.trim() ?? "";
  return i || undefined;
}

function formatAgentActivityDateCell(agent: AdminAgent): string {
  const raw = getAgentActivityDateValue(agent);
  return raw ? formatDateTime(raw) : "—";
}

function AdminAgentPhoneTableCell({
  phone,
}: {
  phone: string | null | undefined;
}): React.ReactNode {
  if (!phone) return "N/A";
  const trimmed = phone.trim();
  if (!trimmed) return "N/A";
  const withoutPlus = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
  if (withoutPlus.startsWith("0")) return "N/A";
  const parts = getProfilePhoneReadonlyDisplay(trimmed);
  if (!parts) return "N/A";
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2 tabular-nums">
      <CountryFlagImg
        iso2={parts.iso2}
        className="h-4 w-5 shrink-0"
        title={parts.iso2}
      />
      <span className="min-w-0 truncate">{parts.nationalLine}</span>
    </span>
  );
}

const TABLE_SKELETON_ROWS = 6;

function AdminAgentsTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: TABLE_SKELETON_ROWS }, (_, i) => (
        <tr key={i} className="border-b border-subtle/70 last:border-b-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-36 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-40 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-20 max-w-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-6 w-20 max-w-full rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-28 max-w-full" />
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className="ml-auto h-8 w-8 max-w-full rounded-md" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export function AdminAgentsPage() {
  const locale = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const {
    currentItems,
    total,
    loading,
    error,
    inviting,
    inviteError,
    inviteSuccessMessage,
    summary,
    summaryStatus,
    summaryError,
  } = useAppSelector((state) => state.adminAgents);
  const [email, setEmail] = useState("");
  const [manualFullName, setManualFullName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState<string | undefined>();
  const [manualServiceArea, setManualServiceArea] = useState<string[]>([]);
  const [manualOnboarding, setManualOnboarding] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState<"choice" | "email" | "manual">(
    "choice",
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<AgentStatusFilterValue>("all");
  /** Search is local-only — not written to the URL (matches AdminUsersPage). */
  const [query, setQuery] = useState<string>("");
  /** Period is local-only — sent to API but not written to the URL (matches AdminUsersPage). */
  const [periodFilter, setPeriodFilter] = useState<"" | "weekly" | "monthly" | "yearly">("");
  const [toast, setToast] = useState<{
    kind: "info" | "error" | "success";
    message: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>([
    { id: "activityDate", direction: "desc" },
  ]);

  const PAGE_PARAM = "page";
  const PAGE_SIZE_PARAM = "pageSize";
  const STATUS_PARAM = "status";

  const resetToFirstPageIfNeeded = useCallback(() => {
    const raw = searchParams.get(PAGE_PARAM);
    const n = Number.parseInt(raw ?? "1", 10);
    const current = Number.isFinite(n) && n >= 1 ? n : 1;
    if (current <= 1) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PAGE_PARAM);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const onPeriodChange = (value: string) => {
    const next =
      value === "weekly" || value === "monthly" || value === "yearly" ? value : "";
    setPeriodFilter(next);
    resetToFirstPageIfNeeded();
  };

  const pageSize = useMemo(() => {
    const raw = searchParams.get(PAGE_SIZE_PARAM);
    const n = Number.parseInt(raw ?? String(DEFAULT_PAGINATION_PAGE_SIZE), 10);
    return PAGINATION_PAGE_SIZES.includes(
      n as (typeof PAGINATION_PAGE_SIZES)[number],
    )
      ? n
      : DEFAULT_PAGINATION_PAGE_SIZE;
  }, [searchParams]);
  const [fullNameIdentifierTouched, setFullNameIdentifierTouched] =
    useState(false);
  const [emailIdentifierTouched, setEmailIdentifierTouched] = useState(false);
  const [phoneIdentifierTouched, setPhoneIdentifierTouched] = useState(false);
  const [serviceAreaIdentifierTouched, setServiceAreaIdentifierTouched] =
    useState(false);
  const [fullNameError, setFullNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [serviceAreaError, setServiceAreaError] = useState<
    string | undefined
  >();

  const applyStatusFilter = (next: AgentStatusFilterValue) => {
    const target =
      next === statusFilter ? ("all" as AgentStatusFilterValue) : next;
    setStatusFilter(target);
    const params = new URLSearchParams(searchParams.toString());
    params.set(PAGE_PARAM, "1");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    void dispatch(fetchAdminAgentsSummary());
  }, [dispatch]);

  /** One-time: hydrate `?status=` into local filter, then remove from URL. */
  useLayoutEffect(() => {
    const raw = searchParams.get(STATUS_PARAM);
    if (!raw) return;

    const normalized =
      raw.trim().toLowerCase() === "all"
        ? ("all" as const)
        : (normalizeAgentStatus(raw) as AgentStatusFilterValue);

    setStatusFilter(normalized);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(STATUS_PARAM);
    params.delete(PAGE_PARAM);
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate `status` once on mount
  }, []);

  useEffect(() => {
    const pageParam = searchParams.get(PAGE_PARAM);
    const pageNumber = Number.parseInt(pageParam ?? "1", 10);
    const page =
      Number.isFinite(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
    const isAllStatus = statusFilter === "all";
    const search = query.trim() || undefined;
    const period = periodFilter || undefined;
    void dispatch(
      fetchAdminAgents({
        page,
        pageSize,
        sort_by: "invited_at",
        order: "desc",
        status: isAllStatus ? undefined : statusFilter,
        search,
        period,
      }),
    );
  }, [dispatch, pageSize, searchParams, statusFilter, query, periodFilter]);

  useEffect(() => {
    return () => {
      dispatch(clearInviteFeedback());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error && !loading) {
      setToast({
        kind: "error",
        message: `Could not load the agent list. ${error}`,
      });
    }
  }, [error, loading]);

  useEffect(() => {
    if (inviteError) setToast({ kind: "error", message: inviteError });
  }, [inviteError]);

  useEffect(() => {
    if (inviteSuccessMessage)
      setToast({ kind: "success", message: inviteSuccessMessage });
  }, [inviteSuccessMessage]);

  useEffect(() => {
    if (summaryError && summaryStatus === "failed") {
      setToast({
        kind: "error",
        message: `Could not load directory stats. ${summaryError}`,
      });
    }
  }, [summaryError, summaryStatus]);

  const totalFromBuckets = summary?.totalAgents ?? 0;
  const activeCount = summary?.activeAgents ?? 0;
  const invitedCount = summary?.pendingInvites ?? 0;
  const pendingReviewCount = summary?.pendingReview ?? 0;
  const declinedCount = summary?.declined ?? 0;
  const summaryStatsLoading = summaryStatus === "loading" && !summary;

  /** Server page slice + optional local status filter; sorting applied separately (client, current page). */
  const filteredRowCandidates = useMemo(() => {
    const statusFiltered =
      statusFilter === "all"
        ? [...currentItems]
        : currentItems.filter((a) => a.status === statusFilter);

    return statusFiltered;
  }, [currentItems, statusFilter]);

  const tableRows = useMemo(
    () =>
      sortRowsByConfig(filteredRowCandidates, sortConfig, (row, columnId) => {
        switch (columnId) {
          case "fullName":
            return row.fullName ?? "";
          case "email":
            return row.email ?? "";
          case "phone":
            return row.phone ?? "";
          case "city":
            return row.city ?? "";
          case "status":
            return row.status ?? "";
          case "activityDate": {
            const raw = getAgentActivityDateValue(row);
            return raw ? Date.parse(raw) : 0;
          }
          default:
            return "";
        }
      }),
    [filteredRowCandidates, sortConfig],
  );

  const onSearchChange = (value: string) => {
    setQuery(value);
    resetToFirstPageIfNeeded();
  };

  const currentPage = useMemo(() => {
    const page = searchParams.get(PAGE_PARAM);
    const n = parseInt(page ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const totalItems = total;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const emptyListMessage = useMemo(() => {
    if (query.trim()) {
      return "No agents match your search. Try a different name, email, or keyword.";
    }
    if (statusFilter !== "all") {
      return "No agents with this status. Set status to All or try another filter.";
    }
    if (totalItems === 0) {
      return "You do not have any agents yet. Use Onboard agent to invite or add your first teammate.";
    }
    return "No agents to show on this page. Try another page or clear your search.";
  }, [query, statusFilter, totalItems]);

  const doInvite = async (normalizedEmail: string) => {
    const result = await dispatch(inviteAdminAgentByEmail(normalizedEmail));
    if (inviteAdminAgentByEmail.fulfilled.match(result)) {
      const fallbackPath = `/${locale}/invite-agent?email=${encodeURIComponent(normalizedEmail)}`;
      const fallbackLink = `${window.location.origin}${fallbackPath}`;
      const link = result.payload.inviteLink ?? fallbackLink;
      setGeneratedInviteLink(link);
      setCopied(false);
      setIsInviteModalOpen(true);
      setEmail("");
    }
  };

  const onInvite = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    const normalizedEmail = email.trim();
    await doInvite(normalizedEmail);
  };

  const onCopyLink = async () => {
    if (!generatedInviteLink) return;
    try {
      await navigator.clipboard.writeText(generatedInviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const getFullNameError = (value: string) => {
    const trimmed = value.trim();
    return !trimmed ? "Full Name is required" : undefined;
  };

  const getEmailError = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email Id is required";
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      ? "Please enter valid Email Id"
      : undefined;
  };

  const getPhoneError = (value: string | undefined) => {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) return "Phone Number is required";
    return !isValidPhoneNumber(trimmed)
      ? "Please enter valid Phone Number"
      : undefined;
  };

  const getServiceAreaError = (value: string[]) => {
    return value.length === 0 ? "Service Area is required" : undefined;
  };

  const resetManualForm = () => {
    setManualFullName("");
    setManualEmail("");
    setManualPhone(undefined);
    setManualServiceArea([]);
    setFullNameIdentifierTouched(false);
    setEmailIdentifierTouched(false);
    setPhoneIdentifierTouched(false);
    setServiceAreaIdentifierTouched(false);
    setFullNameError(undefined);
    setEmailError(undefined);
    setPhoneError(undefined);
    setServiceAreaError(undefined);
  };

  const validateManualFields = () => {
    const nextFullNameError = getFullNameError(manualFullName);
    const nextEmailError = getEmailError(manualEmail);
    const nextPhoneError = getPhoneError(manualPhone);
    const nextServiceAreaError = getServiceAreaError(manualServiceArea);

    setFullNameError(nextFullNameError);
    setEmailError(nextEmailError);
    setPhoneError(nextPhoneError);
    setServiceAreaError(nextServiceAreaError);

    return {
      fullName: nextFullNameError,
      email: nextEmailError,
      phone: nextPhoneError,
      serviceArea: nextServiceAreaError,
    };
  };

  const validateFullName = () => {
    setFullNameIdentifierTouched(true);
    setFullNameError(getFullNameError(manualFullName));
  };
  const validateEmail = () => {
    setEmailIdentifierTouched(true);
    setEmailError(getEmailError(manualEmail));
  };
  const validatePhone = () => {
    setPhoneIdentifierTouched(true);
    setPhoneError(getPhoneError(manualPhone));
  };
  const validateServiceArea = () => {
    setServiceAreaIdentifierTouched(true);
    setServiceAreaError(getServiceAreaError(manualServiceArea));
  };

  const onManualOnboard = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setFullNameIdentifierTouched(true);
    setEmailIdentifierTouched(true);
    setPhoneIdentifierTouched(true);
    setServiceAreaIdentifierTouched(true);

    const { fullName, email, phone, serviceArea } = validateManualFields();
    const hasError = !!fullName || !!email || !!phone || !!serviceArea;
    if (hasError) return;

    try {
      setManualOnboarding(true);
      const result = await dispatch(
        createAdminAgentManually({
          fullName: manualFullName,
          email: manualEmail,
          phone: manualPhone ?? "",
          city: manualServiceArea.join(", "),
        }),
      );

      if (createAdminAgentManually.fulfilled.match(result)) {
        setToast({ kind: "success", message: "Agent onboarded successfully" });
        resetManualForm();
        setOnboardStep("choice");
        setIsOnboardModalOpen(false);
      } else {
        const message =
          (typeof result.payload === "string" && result.payload) ||
          result.error.message ||
          "Failed to onboard agent";
        setToast({ kind: "error", message });
      }
    } catch (error) {
      setToast({ kind: "error", message: getApiErrorMessage(error) });
    } finally {
      setManualOnboarding(false);
    }
  };

  const adminId = currentUser?.id ?? null;

  const agentTableColumns: CustomTableColumn<AdminAgent>[] = useMemo(
    () => [
      {
        id: "fullName",
        header: "Agent",
        sortable: true,
        getSortValue: (row) => row.fullName ?? "",
        cellClassName: "fw-medium text-charcoal",
        render: (agent) => agent.fullName ?? "—",
      },
      {
        id: "email",
        header: "Email",
        sortable: true,
        getSortValue: (row) => row.email ?? "",
        cellClassName: "text-charcoal/80",
        render: (agent) => agent.email ?? "—",
      },
      {
        id: "phone",
        header: "Phone",
        sortable: true,
        getSortValue: (row) => row.phone ?? "",
        cellClassName: "text-charcoal/80",
        render: (agent) => <AdminAgentPhoneTableCell phone={agent.phone} />,
      },
      {
        id: "city",
        header: "City",
        sortable: true,
        getSortValue: (row) => row.city ?? "",
        cellClassName: "text-charcoal/80",
        render: (agent) => agent.city ?? "—",
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        getSortValue: (row) => row.status ?? "",
        render: (agent) => (
          <span
            className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${getAgentStatusClass(
              agent.status ?? AGENT_STATUS.INVITED,
            )}`}
          >
            {getAgentStatusLabel(agent.status ?? AGENT_STATUS.INVITED)}
          </span>
        ),
      },
      {
        id: "activityDate",
        header: "Activity Date",
        sortable: true,
        getSortValue: (row) => {
          const raw = getAgentActivityDateValue(row);
          return raw ? Date.parse(raw) : 0;
        },
        cellClassName: "text-charcoal/80",
        render: (agent) => formatAgentActivityDateCell(agent),
      },
      {
        id: "actions",
        header: <span className="block text-right">Actions</span>,
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (agent) => (
          <AdminAgentActionsMenu
            agent={agent}
            adminId={adminId}
            onToast={(t) => setToast(t)}
          />
        ),
      },
    ],
    [adminId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">
            Agents
          </h1>
          <p className="mt-1 text-size-sm text-charcoal/70">
            Manage your team and invite new agents by email.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsOnboardModalOpen(true)}
          >
            <UserPlus2 className="h-4 w-4" />
            Onboard agent
          </Button>
        </div>
      </div>

      <AdminAgentsStatsSection
        totalFromBuckets={totalFromBuckets}
        activeCount={activeCount}
        invitedCount={invitedCount}
        pendingReviewCount={pendingReviewCount}
        declinedCount={declinedCount}
        isLoading={summaryStatsLoading}
        onStatusFilter={applyStatusFilter}
      />

      <ConfirmDialog
        open={isOnboardModalOpen}
        title="Onboard agent"
        showCloseIcon
        showFooter={false}
        onCancel={() => {
          setIsOnboardModalOpen(false);
          setOnboardStep("choice");
          resetManualForm();
        }}
        onConfirm={async () => {}}
      >
        <div className="space-y-4">
          {onboardStep === "choice" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-xl border border-subtle bg-white p-4 text-left hover:bg-surface/30"
                onClick={() => setOnboardStep("email")}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  <p className="text-sm fw-semibold text-charcoal">
                    Invite by email
                  </p>
                </div>
                <p className="mt-1 text-xs text-charcoal/70">
                  Send an invitation link to the agent’s email.
                </p>
              </button>
              <button
                type="button"
                className="rounded-xl border border-subtle bg-white p-4 text-left hover:bg-surface/30"
                onClick={() => setOnboardStep("manual")}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <p className="text-sm fw-semibold text-charcoal">
                    Manual onboarding
                  </p>
                </div>
                <p className="mt-1 text-xs text-charcoal/70">
                  Create an agent account directly by entering details.
                </p>
              </button>
            </div>
          ) : null}

          {onboardStep === "email" ? (
            <div>
              <form onSubmit={onInvite} className="space-y-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@example.com"
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOnboardStep("choice");
                      setEmail("");
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" variant="accent" disabled={inviting}>
                    {inviting ? "Inviting..." : "Send invite"}
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          {onboardStep === "manual" ? (
            <ManualAgentInputForm
              fullName={manualFullName}
              email={manualEmail}
              phone={manualPhone}
              serviceArea={manualServiceArea}
              loading={manualOnboarding}
              fullNameError={fullNameError}
              emailError={emailError}
              phoneError={phoneError}
              serviceAreaError={serviceAreaError}
              onFocusFullName={validateFullName}
              onFocusEmail={validateEmail}
              onFocusPhone={validatePhone}
              onFocusServiceArea={validateServiceArea}
              onSubmit={onManualOnboard}
              onFullNameChange={(val) => {
                setManualFullName(val);
                if (fullNameIdentifierTouched)
                  setFullNameError(getFullNameError(val));
              }}
              onEmailChange={(val) => {
                setManualEmail(val);
                if (emailIdentifierTouched) setEmailError(getEmailError(val));
              }}
              onPhoneChange={(val) => {
                setManualPhone(val);
                if (phoneIdentifierTouched) setPhoneError(getPhoneError(val));
              }}
              onServiceAreaChange={(val) => {
                setManualServiceArea(val);
                if (serviceAreaIdentifierTouched)
                  setServiceAreaError(getServiceAreaError(val));
              }}
            />
          ) : null}
        </div>
      </ConfirmDialog>

      <Card className="rounded-xl border-subtle">
        <CardHeader className="flex flex-col gap-3 space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">
              Agent list
            </CardTitle>
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-64 lg:w-80">
                <Input
                  value={query}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search agents..."
                  className="h-10 w-full rounded-lg"
                  rightAdornment={
                    query.trim() ? (
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Clear search"
                        className="text-charcoal/55 hover:bg-charcoal/10 hover:text-charcoal"
                        onClick={() => onSearchChange("")}
                      >
                        <X />
                      </IconButton>
                    ) : undefined
                  }
                />
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Dropdown
                  buttonId="agent-status-filter"
                  label="All"
                  buttonClassName="h-10 rounded-lg border-subtle px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                  value={statusFilter}
                  onChange={(value) => {
                    const next = value as AgentStatusFilterValue;
                    applyStatusFilter(next);
                  }}
                  align="right"
                  options={AGENT_STATUS_FILTER_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                />
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <Dropdown
                  buttonId="admin-agents-period-filter"
                  label="All"
                  value={periodFilter}
                  onChange={(val) => onPeriodChange(val)}
                  align="right"
                  menuClassName="w-44"
                  buttonClassName="h-10 rounded-lg border-subtle bg-surface px-3 text-size-xs text-charcoal shadow-sm focus-visible:ring-primary/40 justify-between"
                  options={[
                    { value: "", label: "All" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomTable<AdminAgent>
            columns={agentTableColumns}
            data={tableRows}
            getRowId={(row) => String(row.id ?? row.email ?? "")}
            sortConfig={sortConfig}
            onSort={setSortConfig}
            multiSortWithShift
            loading={loading}
            skeleton={<AdminAgentsTableSkeleton />}
            error={error}
            errorTitle="Something went wrong while loading agents."
            emptyMessage={emptyListMessage}
            minTableWidth="900px"
            pagination={{
              showWhen:
                !loading && !error && totalPages > 1 && tableRows.length > 0,
              currentPage: safePage,
              totalPages,
              totalItems,
              pageSize,
              pageParam: PAGE_PARAM,
              pageSizeParam: PAGE_SIZE_PARAM,
              translations: {
                previous: "Previous",
                next: "Next",
                page: "Page",
                of: "of",
                showing: "Showing",
                to: "to",
                results: "agents",
              },
            }}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isInviteModalOpen}
        title="Invitation link ready"
        description="The invitation link has been created. Copy the link below or send it via email to the agent."
        showFooter={false}
        onCancel={() => setIsInviteModalOpen(false)}
        onConfirm={async () => {}}
      >
        <div className="mt-4 rounded-lg border border-subtle bg-surface px-3 py-2">
          <p className="break-all text-size-sm text-charcoal">
            {generatedInviteLink}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsInviteModalOpen(false)}
          >
            Close
          </Button>
          <a
            href={`mailto:?subject=${encodeURIComponent("Agent Invitation Link")}&body=${encodeURIComponent(
              `Please use this invite link:\n${generatedInviteLink}`,
            )}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-size-sm fw-semibold text-white hover:brightness-95"
          >
            <Mail className="h-4 w-4" />
            Send via email
          </a>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => void onCopyLink()}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-700" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </ConfirmDialog>

      {toast ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
