"use client";

import { AdminAgentActionsMenu } from "@/components/admin/agents/AdminAgentActionsMenu";
import { ManualAgentInputForm } from "@/components/agent/ManualAgentInputForm";
import {
  Button,
  ConfirmDialog,
  Dropdown,
  Input,
  LoadingScreen,
  Toast,
} from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/Pagination";
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
import {
  Check,
  Copy,
  Mail,
  RefreshCw,
  UserCheck,
  UserPlus2,
  Users,
} from "lucide-react";
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
    page: storePage,
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
  const [onboardStep, setOnboardStep] = useState<"choice" | "email" | "manual">(
    "choice",
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<AgentStatusFilterValue>("all");
  const [toast, setToast] = useState<{
    kind: "info" | "error" | "success";
    message: string;
  } | null>(null);

  const PAGE_SIZE = 10;
  const PAGE_PARAM = "page";
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
    // Reset pagination to page 1 when filter changes
    const params = new URLSearchParams(searchParams.toString());
    params.set(PAGE_PARAM, "1");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  useEffect(() => {
    const pageParam = searchParams.get(PAGE_PARAM);
    const pageNumber = Number.parseInt(pageParam ?? "1", 10);
    const page =
      Number.isFinite(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
    const isAllStatus = statusFilter === "all";
    void dispatch(
      fetchAdminAgents({
        page,
        limit: PAGE_SIZE,
        sort_by: "invited_at",
        order: "desc",
        status: isAllStatus ? undefined : statusFilter,
      }),
    );
  }, [dispatch, searchParams, statusFilter]);

  useEffect(() => {
    return () => {
      dispatch(clearInviteFeedback());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error && !loading) {
      setToast({
        kind: "error",
        message: error,
      });
    }
  }, [error, loading]);

  useEffect(() => {
    if (inviteError) {
      setToast({
        kind: "error",
        message: inviteError,
      });
    }
  }, [inviteError]);

  useEffect(() => {
    if (inviteSuccessMessage) {
      setToast({
        kind: "success",
        message: inviteSuccessMessage,
      });
    }
  }, [inviteSuccessMessage]);

  const invitedCount = useMemo(
    () =>
      allItems.filter((agent) => agent.status === AGENT_STATUS.INVITED).length,
    [allItems],
  );

  const activeCount = useMemo(
    () =>
      allItems.filter((agent) => agent.status === AGENT_STATUS.ACTIVE).length,
    [allItems],
  );

  const pendingReviewCount = useMemo(
    () =>
      allItems.filter((agent) => agent.status === AGENT_STATUS.PENDING_REVIEW)
        .length,
    [allItems],
  );

  const declinedCount = useMemo(
    () =>
      allItems.filter((agent) => agent.status === AGENT_STATUS.DECLINED).length,
    [allItems],
  );

  const totalFromBuckets =
    activeCount + invitedCount + pendingReviewCount + declinedCount;

  const filteredItems = useMemo(() => {
    // Sort current page items by invitedAt (newest first) and then apply status filter
    const sorted = [...currentItems].sort((a, b) => {
      const atA = new Date(a.invitedAt ?? 0).getTime();
      const atB = new Date(b.invitedAt ?? 0).getTime();
      return atB - atA;
    });
    if (statusFilter === "all") return sorted;
    return sorted.filter((a) => a.status === statusFilter);
  }, [currentItems, statusFilter]);

  const currentPage = useMemo(() => {
    const page = searchParams.get(PAGE_PARAM);
    const n = parseInt(page ?? "1", 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const totalItems = total;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
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
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      ? "Please enter valid Email Id"
      : undefined;
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

  const onManualOnboard = async (
    event: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    // Mark all fields as touched so errors show if missing/invalid
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
            variant="outline"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            <RefreshCw className="h-4 w-4" />
            Back to dashboard
          </Button>
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
      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        <Card className="rounded-2xl border-subtle">
          <CardContent>
            <p className="text-size-xs text-charcoal/70">Total agents</p>
            <p className="mt-2 text-size-2xl fw-semibold text-charcoal">
              {totalFromBuckets}
            </p>
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
            <p className="mt-2 text-size-2xl fw-semibold text-emerald-700">
              {activeCount}
            </p>
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
            <p className="mt-2 text-size-2xl fw-semibold text-amber-700">
              {invitedCount}
            </p>
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
            <p className="mt-2 text-size-2xl fw-semibold text-amber-700">
              {pendingReviewCount}
            </p>
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
            <p className="mt-2 text-size-2xl fw-semibold text-rose-700">
              {declinedCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <ConfirmDialog
        open={isOnboardModalOpen}
        title="Onboard agent"
        showCloseIcon
        size="lg"
        showFooter={false}
        description={
          onboardStep === "choice"
            ? "Choose how you would like to onboard a new agent."
            : onboardStep === "email"
              ? "Generate an invitation link and send it to the agent via email."
              : "Collect agent details directly in a form."
        }
        onCancel={() => {
          setIsOnboardModalOpen(false);
          setOnboardStep("choice");
          resetManualForm();
        }}
        onConfirm={async () => {}}
      >
        {onboardStep === "choice" && (
          <div className="mt-4 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="flex w-full items-center justify-between rounded-xl border-subtle bg-surface px-4 py-3"
              onClick={() => setOnboardStep("email")}
            >
              <span className="flex items-center gap-2 text-size-sm">
                <Mail className="h-4 w-4 text-secondary" />
                Send Email Invitation
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex w-full items-center justify-between rounded-xl border-dashed border-subtle bg-surface/60 px-4 py-3"
              onClick={() => setOnboardStep("manual")}
            >
              <span className="flex items-center gap-2 text-size-sm">
                <UserCheck className="h-4 w-4 text-secondary" />
                Fill in Manual form
              </span>
            </Button>
          </div>
        )}

        {onboardStep === "email" && (
          <div className="mt-4 space-y-4">
            <form
              onSubmit={onInvite}
              className="mt-3 flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                value={email}
                className="h-12 rounded-xl"
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (inviteError || inviteSuccessMessage)
                    dispatch(clearInviteFeedback());
                }}
                placeholder="agent@example.com"
                required
              />
              <Button
                type="submit"
                size="lg"
                disabled={inviting}
                className="h-12 w-full rounded-xl text-white sm:w-60"
              >
                {inviting ? "Generating..." : "Generate link"}
              </Button>
            </form>
          </div>
        )}

        {onboardStep === "manual" && (
          <div className="mt-4 space-y-4">
            <section className="rounded-xl border border-dashed border-subtle bg-surface/60 p-4">
              <h3 className="flex items-center gap-2 text-size-sm fw-semibold text-charcoal">
                <UserCheck className="h-4 w-4 text-secondary" />
                Manual form
              </h3>
              <p className="mt-1 text-size-xs text-charcoal/70">
                Fill in agent details to manually onboard an agent.
              </p>
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
                onFullNameChange={(value) => {
                  setManualFullName(value);
                  if (fullNameIdentifierTouched) {
                    setFullNameError(getFullNameError(value));
                  }
                }}
                onEmailChange={(value) => {
                  setManualEmail(value);
                  if (emailIdentifierTouched) {
                    setEmailError(getEmailError(value));
                  }
                }}
                onPhoneChange={(value) => {
                  setManualPhone(value);
                  if (phoneIdentifierTouched) {
                    setPhoneError(getPhoneError(value));
                  }
                }}
                onServiceAreaChange={(value) => {
                  setManualServiceArea(value);
                  if (serviceAreaIdentifierTouched) {
                    setServiceAreaError(getServiceAreaError(value));
                  }
                }}
              />
            </section>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          {onboardStep !== "email" && onboardStep !== "manual" ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setIsOnboardModalOpen(false);
                setOnboardStep("choice");
                resetManualForm();
              }}
            >
              Close
            </Button>
          ) : null}
          {onboardStep !== "choice" ? (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setOnboardStep("choice")}
            >
              Back
            </Button>
          ) : null}
        </div>
      </ConfirmDialog>

      <Card className="rounded-2xl border-subtle">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <CardTitle className="text-size-sm text-charcoal">
              Agent list
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingScreen
              title="Loading agents"
              description="Please wait while we load your agents."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-subtle text-size-xs text-charcoal/70">
                      <th className="px-2 py-2 fw-medium">Name</th>
                      <th className="px-2 py-2 fw-medium">Email</th>
                      <th className="px-2 py-2 fw-medium">Phone</th>
                      <th className="px-2 py-2 fw-medium">City</th>
                      <th className="px-2 py-2 fw-medium">Invited by</th>
                      <th className="px-2 py-2 fw-medium">Invited at</th>
                      <th className="px-2 py-2 fw-medium">Status</th>
                      <th className="px-2 py-2 fw-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-2 py-10 text-center text-size-sm text-charcoal/70"
                        >
                          No agents found.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((agent) => (
                        <tr
                          key={agent.id}
                          className="border-b border-subtle/70 text-size-sm last:border-0"
                        >
                          <td className="px-2 py-3 fw-semibold text-charcoal">
                            {agent.fullName}
                          </td>
                          <td className="px-2 py-3 text-charcoal/80">
                            {agent.email}
                          </td>
                          <td className="px-2 py-3 text-charcoal/80">
                            {formatPhoneForList(agent.phone)}
                          </td>
                          <td className="px-2 py-3 text-charcoal/80">
                            {agent.city}
                          </td>
                          <td className="px-2 py-3 text-charcoal/80">
                            {agent.invitedBy}
                          </td>
                          <td className="px-2 py-3 text-charcoal/70">
                            {formatDateTime(agent.invitedAt ?? "")}
                          </td>
                          <td className="px-2 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-size-11 fw-medium capitalize ${getAgentStatusClass(agent.status ?? "")}`}
                            >
                              {getAgentStatusLabel(agent.status ?? "")}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <AdminAgentActionsMenu
                              agent={agent}
                              adminId={currentUser?.id ?? null}
                              onToast={(nextToast) => setToast(nextToast)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 border-t border-subtle pt-4">
                  <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    pageParam={PAGE_PARAM}
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
            href={`mailto:?subject=${encodeURIComponent(
              "Agent Invitation Link",
            )}&body=${encodeURIComponent(
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
