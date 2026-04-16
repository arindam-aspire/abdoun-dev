"use client";

import { AdminAgentActionsMenu } from "@/features/admin-agents/components/AdminAgentActionsMenu";
import { ManualAgentInputForm } from "@/features/admin-agents/components/ManualAgentInputForm";
import {
  Button,
  ConfirmDialog,
  Dropdown,
  Input,
  LoadingScreen,
  Spinner,
  Toast,
} from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEFAULT_PAGINATION_PAGE_SIZE,
  PAGINATION_PAGE_SIZES,
  Pagination,
} from "@/components/ui/Pagination";
import {
  AGENT_STATUS,
  AGENT_STATUS_FILTER_OPTIONS,
  getAgentStatusClass,
  getAgentStatusLabel,
  type AgentStatusFilterValue,
} from "@/constants/agentStatus";
import {
  clearInviteFeedback,
  createAdminAgentManually,
  fetchAdminAgents,
  inviteAdminAgentByEmail,
} from "@/features/admin-agents/adminAgentsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import type { AppLocale } from "@/i18n/routing";
import { getApiErrorMessage } from "@/lib/http";
import { selectCurrentUser } from "@/store/selectors";
import { Check, Copy, Mail, RefreshCw, UserCheck, UserPlus2, Users } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useMemo, useState } from "react";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatPhoneForList(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  const trimmed = phone.trim();
  if (!trimmed) return "N/A";
  const withoutPlus = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
  return withoutPlus.startsWith("0") ? "N/A" : trimmed;
}

export function AdminAgentsPage() {
  const locale = useLocale() as AppLocale;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const {
    allItems,
    currentItems,
    total,
    loading,
    error,
    inviting,
    inviteError,
    inviteSuccessMessage,
  } = useAppSelector((state) => state.adminAgents);
  const [email, setEmail] = useState("");
  const [manualFullName, setManualFullName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState<string | undefined>();
  const [manualServiceArea, setManualServiceArea] = useState("");
  const [manualOnboarding, setManualOnboarding] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState<"choice" | "email" | "manual">("choice");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<AgentStatusFilterValue>("all");
  const [query, setQuery] = useState<string>(searchParams.get("q") ?? "");
  const [toast, setToast] = useState<{
    kind: "info" | "error" | "success";
    message: string;
  } | null>(null);

  const PAGE_PARAM = "page";
  const PAGE_SIZE_PARAM = "pageSize";

  const pageSize = useMemo(() => {
    const raw = searchParams.get(PAGE_SIZE_PARAM);
    const n = Number.parseInt(raw ?? String(DEFAULT_PAGINATION_PAGE_SIZE), 10);
    return PAGINATION_PAGE_SIZES.includes(n as (typeof PAGINATION_PAGE_SIZES)[number])
      ? n
      : DEFAULT_PAGINATION_PAGE_SIZE;
  }, [searchParams]);
  const [fullNameIdentifierTouched, setFullNameIdentifierTouched] = useState(false);
  const [emailIdentifierTouched, setEmailIdentifierTouched] = useState(false);
  const [phoneIdentifierTouched, setPhoneIdentifierTouched] = useState(false);
  const [serviceAreaIdentifierTouched, setServiceAreaIdentifierTouched] = useState(false);
  const [fullNameError, setFullNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [serviceAreaError, setServiceAreaError] = useState<string | undefined>();

  const applyStatusFilter = (next: AgentStatusFilterValue) => {
    const target = next === statusFilter ? ("all" as AgentStatusFilterValue) : next;
    setStatusFilter(target);
    const params = new URLSearchParams(searchParams.toString());
    params.set(PAGE_PARAM, "1");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const pageParam = searchParams.get(PAGE_PARAM);
    const pageNumber = Number.parseInt(pageParam ?? "1", 10);
    const page = Number.isFinite(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
    const isAllStatus = statusFilter === "all";
    void dispatch(
      fetchAdminAgents({
        page,
        limit: pageSize,
        sort_by: "invited_at",
        order: "desc",
        status: isAllStatus ? undefined : statusFilter,
      }),
    );
  }, [dispatch, pageSize, searchParams, statusFilter]);

  useEffect(() => {
    return () => {
      dispatch(clearInviteFeedback());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error && !loading) setToast({ kind: "error", message: error });
  }, [error, loading]);

  useEffect(() => {
    if (inviteError) setToast({ kind: "error", message: inviteError });
  }, [inviteError]);

  useEffect(() => {
    if (inviteSuccessMessage) setToast({ kind: "success", message: inviteSuccessMessage });
  }, [inviteSuccessMessage]);

  const invitedCount = useMemo(
    () => allItems.filter((agent) => agent.status === AGENT_STATUS.INVITED).length,
    [allItems],
  );
  const activeCount = useMemo(
    () => allItems.filter((agent) => agent.status === AGENT_STATUS.ACTIVE).length,
    [allItems],
  );
  const pendingReviewCount = useMemo(
    () => allItems.filter((agent) => agent.status === AGENT_STATUS.PENDING_REVIEW).length,
    [allItems],
  );
  const declinedCount = useMemo(
    () => allItems.filter((agent) => agent.status === AGENT_STATUS.DECLINED).length,
    [allItems],
  );
  const totalFromBuckets = activeCount + invitedCount + pendingReviewCount + declinedCount;

  const filteredItems = useMemo(() => {
    const sorted = [...currentItems].sort((a, b) => {
      const atA = new Date(a.invitedAt ?? 0).getTime();
      const atB = new Date(b.invitedAt ?? 0).getTime();
      return atB - atA;
    });
    const statusFiltered =
      statusFilter === "all" ? sorted : sorted.filter((a) => a.status === statusFilter);

    const q = query.trim().toLowerCase();
    if (!q) return statusFiltered;
    return statusFiltered.filter((agent) => {
      const haystack = [
        agent.fullName,
        agent.email,
        agent.phone,
        agent.city,
        agent.invitedBy,
        agent.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [currentItems, query, statusFilter]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const updateQueryParam = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (!value.trim()) params.delete("q");
    else params.set("q", value);
    params.set(PAGE_PARAM, "1");
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const currentPage = useMemo(() => {
    const page = searchParams.get(PAGE_PARAM);
    const n = parseInt(page ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const totalItems = total;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

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
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? "Please enter valid Email Id" : undefined;
  };

  const getPhoneError = (value: string | undefined) => {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) return "Phone Number is required";
    return !isValidPhoneNumber(trimmed) ? "Please enter valid Phone Number" : undefined;
  };

  const getServiceAreaError = (value: string) => {
    const trimmed = value.trim();
    return !trimmed ? "Service Area is required" : undefined;
  };

  const resetManualForm = () => {
    setManualFullName("");
    setManualEmail("");
    setManualPhone(undefined);
    setManualServiceArea("");
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

  const onManualOnboard = async (event: React.SyntheticEvent<HTMLFormElement>) => {
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
          city: manualServiceArea,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 px-1 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-size-2xl fw-semibold text-charcoal md:text-size-3xl">Agents</h1>
          <p className="mt-1 text-size-sm text-charcoal/70">Manage your team and invite new agents by email.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/dashboard`)}>
            <RefreshCw className="h-4 w-4" />
            Back to dashboard
          </Button>
          <Button type="button" variant="primary" onClick={() => setIsOnboardModalOpen(true)}>
            <UserPlus2 className="h-4 w-4" />
            Onboard agent
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        <Card className="rounded-2xl border-subtle">
          <CardContent>
            <p className="text-size-xs text-charcoal/70">Total agents</p>
            <p className="mt-2 text-size-2xl fw-semibold text-charcoal">{totalFromBuckets}</p>
          </CardContent>
        </Card>
        <Card
          className="rounded-2xl border-subtle cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => applyStatusFilter(AGENT_STATUS.ACTIVE)}
        >
          <CardContent>
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-size-xs text-charcoal/70">Active agents</p>
            </div>
            <p className="mt-2 text-size-2xl fw-semibold text-emerald-700">{activeCount}</p>
          </CardContent>
        </Card>
        <Card
          className="rounded-2xl border-subtle cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => applyStatusFilter(AGENT_STATUS.INVITED)}
        >
          <CardContent>
            <p className="text-size-xs text-charcoal/70">Pending invites</p>
            <p className="mt-2 text-size-2xl fw-semibold text-amber-700">{invitedCount}</p>
          </CardContent>
        </Card>
        <Card
          className="rounded-2xl border-subtle cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => applyStatusFilter(AGENT_STATUS.PENDING_REVIEW)}
        >
          <CardContent>
            <p className="text-size-xs text-charcoal/70">Pending review</p>
            <p className="mt-2 text-size-2xl fw-semibold text-amber-700">{pendingReviewCount}</p>
          </CardContent>
        </Card>
        <Card
          className="rounded-2xl border-subtle cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => applyStatusFilter(AGENT_STATUS.DECLINED)}
        >
          <CardContent>
            <p className="text-size-xs text-charcoal/70">Declined</p>
            <p className="mt-2 text-size-2xl fw-semibold text-rose-700">{declinedCount}</p>
          </CardContent>
        </Card>
      </section>

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
                  <p className="text-sm fw-semibold text-charcoal">Invite by email</p>
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
                  <p className="text-sm fw-semibold text-charcoal">Manual onboarding</p>
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
                if (fullNameIdentifierTouched) setFullNameError(getFullNameError(val));
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
                if (serviceAreaIdentifierTouched) setServiceAreaError(getServiceAreaError(val));
              }}
            />
          ) : null}
        </div>
      </ConfirmDialog>

      <Card className="rounded-2xl border-subtle">
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
                  onChange={(event) => updateQueryParam(event.target.value)}
                  placeholder="Search agents..."
                  className="h-10 w-full rounded-xl"
                />
              </div>
              <div className="flex w-full items-center gap-2 md:w-auto">
                <span className="text-size-xs text-charcoal/70">Status</span>
                <Dropdown
                  buttonId="agent-status-filter"
                  label="All"
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Dropdown
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as AgentStatusFilterValue)}
                options={[...AGENT_STATUS_FILTER_OPTIONS]}
              />
              <Button type="button" variant="outline" onClick={() => applyStatusFilter(statusFilter)}>
                Apply
              </Button>
            </div>
            <div className="text-sm text-charcoal/70">
              Page {safePage} of {totalPages} · Total {totalItems}
            </div>
          </div>

          {loading ? (
            <div className="relative flex items-center justify-center my-6">
              <Spinner size="lg" className="relative text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-sm text-rose-700">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-subtle bg-surface text-xs text-charcoal/65">
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Invited</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((agent) => (
                      <tr key={agent.id} className="border-b border-subtle/70 last:border-b-0">
                        <td className="px-4 py-3 fw-medium text-charcoal">{agent.fullName ?? "—"}</td>
                        <td className="px-4 py-3 text-charcoal/80">{agent.email ?? "—"}</td>
                        <td className="px-4 py-3 text-charcoal/80">{formatPhoneForList(agent.phone)}</td>
                        <td className="px-4 py-3 text-charcoal/80">{agent.city ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${getAgentStatusClass(
                              agent.status ?? AGENT_STATUS.INVITED,
                            )}`}
                          >
                            {getAgentStatusLabel(agent.status ?? AGENT_STATUS.INVITED)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-charcoal/80">{agent.invitedAt ? formatDateTime(agent.invitedAt) : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <AdminAgentActionsMenu
                            agent={agent}
                            adminId={adminId}
                            onToast={(t) => setToast(t)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 border-t border-subtle pt-4">
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    pageParam={PAGE_PARAM}
                    pageSizeParam={PAGE_SIZE_PARAM}
                    translations={{
                      previous: "Previous",
                      next: "Next",
                      page: "Page",
                      of: "of",
                      showing: "Showing",
                      to: "to",
                      results: "agents",
                    }}
                  />
                </div>
              )}
            </>
          )}
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
          <p className="break-all text-size-sm text-charcoal">{generatedInviteLink}</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" size="md" onClick={() => setIsInviteModalOpen(false)}>
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
          <Button type="button" variant="outline" size="md" onClick={() => void onCopyLink()}>
            {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </ConfirmDialog>

      {toast ? <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

