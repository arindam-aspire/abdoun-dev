"use client";

import { useCallback, useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";
import { ActionsMenu, IconButton } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AGENT_STATUS } from "@/constants/agentStatus";
import { inviteAdminAgent, type AdminAgent } from "@/services/adminAgentApiService";
import {
  approveAdminAgent,
  declineAdminAgent,
  deleteAdminAgent,
  grantAdminAccessForAgent,
} from "@/features/admin-agents/adminAgentsSlice";
import { useAppDispatch } from "@/hooks/storeHooks";

type ToastPayload = { kind: "info" | "error" | "success"; message: string };

export type AdminAgentActionsMenuProps = {
  agent: AdminAgent;
  adminId: string | null;
  onToast: (toast: ToastPayload) => void;
};

type ActionKey =
  | "resend-invite"
  | "revoke-invite"
  | "approve"
  | "decline"
  | "set-active"
  | "set-inactive"
  | "grant-admin"
  | "delete";

export function AdminAgentActionsMenu({
  agent,
  adminId,
  onToast,
}: AdminAgentActionsMenuProps) {
  const dispatch = useAppDispatch();
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const canGrantAdminAccess = Boolean(adminId);

  const run = useCallback(
    async (key: string, fn: () => Promise<unknown>, successMessage: string) => {
      setBusyKey(key);
      try {
        await fn();
        onToast({ kind: "success", message: successMessage });
      } catch (error) {
        const anyError = error as {
          response?: { data?: { detail?: unknown; message?: unknown } };
          message?: string;
        };

        const detail =
          anyError.response?.data?.detail ??
          anyError.response?.data?.message ??
          anyError.message;

        const message =
          typeof detail === "string" && detail.trim()
            ? detail
            : "Action failed.";

        onToast({ kind: "error", message });
      } finally {
        setBusyKey(null);
      }
    },
    [onToast],
  );

  const items = useMemo(() => {
    const list: Array<{
      key: ActionKey;
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      destructive?: boolean;
      className?: string;
      hoverClassName?: string;
    }> = [];

    if (agent.status === AGENT_STATUS.INVITED) {
      // Invited agents: only invitation-related actions + delete.
      list.push({
        key: "resend-invite",
        label: "Resend invitation",
        disabled: busyKey !== null,
        className: "text-blue-700",
        hoverClassName: "bg-blue-50",
        onSelect: () => {
          setPendingAction("resend-invite");
        },
      });

      list.push({
        key: "revoke-invite",
        label: "Revoke invitation",
        disabled: busyKey !== null,
        className: "text-orange-700",
        hoverClassName: "bg-orange-50",
        onSelect: () => {
          setPendingAction("revoke-invite");
        },
      });
    } else if (agent.status === AGENT_STATUS.PENDING_REVIEW) {
      list.push({
        key: "approve",
        label: "Approve",
        disabled: busyKey !== null,
        className: "text-green-700",
        hoverClassName: "bg-green-50",
        onSelect: () => {
          setPendingAction("approve");
        },
      });
      list.push({
        key: "decline",
        label: "Decline",
        disabled: busyKey !== null,
        className: "text-rose-700",
        hoverClassName: "bg-rose-100",
        onSelect: () => {
          setPendingAction("decline");
        },
      });
    } else if (agent.status === AGENT_STATUS.DECLINED) {
      // Declined agents: allow approving again or deleting.
      list.push({
        key: "approve",
        label: "Approve",
        disabled: busyKey !== null,
        className: "text-green-700",
        hoverClassName: "bg-green-50",
        onSelect: () => {
          setPendingAction("approve");
        },
      });
    } else {
      const isActive = agent.status === AGENT_STATUS.ACTIVE;
      list.push({
        key: isActive ? "set-inactive" as const : "set-active",
        label: isActive ? "Set inactive" : "Set active",
        disabled: busyKey !== null,
        // Active gets positive styling; inactive keeps default neutraI.
        className: isActive ? undefined : "text-green-700",
        hoverClassName: isActive ? undefined : "bg-green-50",
        onSelect: () => {
          setPendingAction(isActive ? "set-inactive" : "set-active");
        },
      });
    }

    // Only active agents can receive admin access
    if (agent.status === AGENT_STATUS.ACTIVE) {
      list.push({
        key: "grant-admin",
        label: "Grant admin access",
        disabled: busyKey !== null || !canGrantAdminAccess,
        className: "text-purple-700",
        hoverClassName: "bg-purple-50",
        onSelect: () => {
          if (!adminId) return;
          setPendingAction("grant-admin");
        },
      });
    }

    list.push({
      key: "delete",
      label: "Delete",
      destructive: true,
      disabled: busyKey !== null,
      onSelect: () => setPendingAction("delete"),
    });

    return list;
    // busyKey intentionally included for disabled state in list
  }, [agent.email, agent.id, agent.status, adminId, busyKey, canGrantAdminAccess]);

  const confirmCopy: Record<
    ActionKey,
    {
      title: string;
      description: string;
      confirmLabel: string;
      confirmButtonClassName?: string;
      cancelButtonClassName?: string;
    }
  > = {
    "resend-invite": {
      title: "Resend invitation?",
      description: `This will send a new invitation email to ${agent.email}.`,
      confirmLabel: "Resend",
      confirmButtonClassName: "bg-blue-700 text-white hover:bg-blue-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
    "revoke-invite": {
      title: "Revoke invitation?",
      description: "The agent will no longer be able to use this invitation link.",
      confirmLabel: "Revoke invitation",
      confirmButtonClassName: "bg-rose-700 text-white hover:bg-rose-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
    approve: {
      title: "Approve agent?",
      description: "This will approve the agent and activate their account.",
      confirmLabel: "Approve",
      confirmButtonClassName: "bg-green-700 text-white hover:bg-green-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
    decline: {
      title: "Decline agent application?",
      description: "The agent application will be declined and cannot be approved automatically.",
      confirmLabel: "Decline",
      confirmButtonClassName: "bg-rose-700 text-white hover:bg-rose-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
    "set-active": {
      title: "Set agent active?",
      description: "The agent will be able to access their account and properties.",
      confirmLabel: "Set active",
      confirmButtonClassName: "bg-green-700 text-white hover:bg-green-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
    "set-inactive": {
      title: "Set agent inactive?",
      description: "The agent will lose access to their account until reactivated.",
      confirmLabel: "Set inactive",
      confirmButtonClassName: "bg-rose-700 text-white hover:bg-rose-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
    "grant-admin": {
      title: "Grant admin access?",
      description: "The agent will inherit admin privileges for assigned properties.",
      confirmLabel: "Grant access",
    },
    delete: {
      title: "Delete agent?",
      description: "This will deactivate the user. You can’t undo this action.",
      confirmLabel: "Delete",
      confirmButtonClassName: "bg-rose-700 text-white hover:bg-rose-800",
      cancelButtonClassName: "text-charcoal/80 hover:bg-charcoal/5",
    },
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;

    const key = pendingAction;
    const resetPending = () => setPendingAction(null);
    const agentId = agent.id;

    if (!agentId) {
      onToast({
        kind: "error",
        message: "Agent id is missing. Please refresh and try again.",
      });
      resetPending();
      return;
    }

    switch (key) {
      case "resend-invite": {
        await run(
          key,
          async () => inviteAdminAgent(agent.email),
          `Invitation resent to ${agent.email}.`,
        );
        resetPending();
        break;
      }
      case "revoke-invite": {
        await run(
          key,
          async () => dispatch(deleteAdminAgent(agentId)).unwrap(),
          "Invitation revoked.",
        );
        resetPending();
        break;
      }
      case "approve": {
        await run(
          key,
          async () => dispatch(approveAdminAgent(agentId)).unwrap(),
          "Agent approved.",
        );
        resetPending();
        break;
      }
      case "decline": {
        await run(
          key,
          async () => dispatch(declineAdminAgent(agentId)).unwrap(),
          "Agent declined.",
        );
        resetPending();
        break;
      }
      case "set-active": {
        await run(
          key,
          async () => dispatch(approveAdminAgent(agentId)).unwrap(),
          "Agent set to active.",
        );
        resetPending();
        break;
      }
      case "set-inactive": {
        await run(
          key,
          async () => dispatch(declineAdminAgent(agentId)).unwrap(),
          "Agent set to inactive.",
        );
        resetPending();
        break;
      }
      case "grant-admin": {
        if (!adminId) {
          resetPending();
          return;
        }
        await run(
          key,
          async () =>
            dispatch(grantAdminAccessForAgent({ adminId, agentId })).unwrap(),
          "Admin access granted.",
        );
        resetPending();
        break;
      }
      case "delete": {
        await run(
          key,
          async () => dispatch(deleteAdminAgent(agentId)).unwrap(),
          "Agent deleted.",
        );
        resetPending();
        break;
      }
      default:
        resetPending();
    }
  };

  const activeConfirm = pendingAction ? confirmCopy[pendingAction] : null;

  return (
    <>
      <ActionsMenu
        align="right"
        trigger={
          <IconButton
            aria-label="Open actions"
            variant="ghost"
            size="sm"
            disabled={busyKey !== null}
            className="rounded-full"
          >
            <MoreVertical />
          </IconButton>
        }
        items={items}
      />

      <ConfirmDialog
        open={Boolean(activeConfirm)}
        title={activeConfirm?.title ?? ""}
        description={activeConfirm ? <>{activeConfirm.description}</> : null}
        confirmLabel={activeConfirm?.confirmLabel ?? "Confirm"}
        confirmButtonClassName={activeConfirm?.confirmButtonClassName}
        cancelButtonClassName={
          activeConfirm?.cancelButtonClassName ??
          "text-charcoal/80 hover:bg-charcoal/5"
        }
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

