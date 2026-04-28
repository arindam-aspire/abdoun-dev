"use client";

import { useCallback, useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";
import { ActionsMenu, IconButton } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteAdminUser,
  setAdminUserActiveStatus,
} from "@/features/admin-users/adminUsersSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import type { UserManagementUser } from "@/services/userService";

export type AdminUserActionsToast = {
  kind: "info" | "error" | "success";
  message: string;
};

export type AdminUserActionsMenuProps = {
  user: UserManagementUser;
  onToast: (toast: AdminUserActionsToast) => void;
};

type PendingAction = "set-active" | "set-inactive" | "delete";

export function AdminUserActionsMenu({ user, onToast }: AdminUserActionsMenuProps) {
  const dispatch = useAppDispatch();
  const statusBusy = useAppSelector((s) => s.adminUsers.statusUpdateUserId === user.id);
  const deleteBusy = useAppSelector((s) => s.adminUsers.deleteUserId === user.id);
  const busy = statusBusy || deleteBusy;
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const runToggle = useCallback(
    async (is_active: boolean) => {
      try {
        await dispatch(setAdminUserActiveStatus({ userId: user.id, is_active })).unwrap();
        onToast({
          kind: "success",
          message: is_active ? "User is now active." : "User is now inactive.",
        });
      } catch (err) {
        const msg = typeof err === "string" && err.trim() ? err : "Could not update user status.";
        onToast({ kind: "error", message: msg });
      }
    },
    [dispatch, onToast, user.id],
  );

  const runDelete = useCallback(async () => {
    try {
      await dispatch(deleteAdminUser({ userId: user.id })).unwrap();
      onToast({ kind: "success", message: "User removed." });
    } catch (err) {
      const msg = typeof err === "string" && err.trim() ? err : "Could not delete user.";
      onToast({ kind: "error", message: msg });
    }
  }, [dispatch, onToast, user.id]);

  const items = useMemo(() => {
    const list: Array<{
      key: string;
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      destructive?: boolean;
      className?: string;
      hoverClassName?: string;
    }> = [
      {
        key: "view",
        label: "View",
        disabled: busy,
        className: "text-charcoal",
        hoverClassName: "bg-primary/5",
        onSelect: () =>
          onToast({
            kind: "info",
            message: `User details for ${user.email} are not wired yet.`,
          }),
      },
      {
        key: "edit",
        label: "Edit",
        disabled: busy,
        className: "text-secondary",
        hoverClassName: "bg-secondary/10",
        onSelect: () =>
          onToast({
            kind: "info",
            message: `Edit user for ${user.email} is not wired yet.`,
          }),
      },
    ];

    if (user.is_active) {
      list.push({
        key: "set-inactive",
        label: "Set inactive",
        disabled: busy,
        className: "text-rose-700",
        hoverClassName: "bg-rose-50",
        onSelect: () => setPendingAction("set-inactive"),
      });
    } else {
      list.push({
        key: "set-active",
        label: "Set active",
        disabled: busy,
        className: "text-emerald-700",
        hoverClassName: "bg-emerald-50",
        onSelect: () => setPendingAction("set-active"),
      });
    }

    list.push({
      key: "delete",
      label: "Delete",
      destructive: true,
      disabled: busy,
      onSelect: () => setPendingAction("delete"),
    });

    return list;
  }, [busy, onToast, user.email, user.is_active]);

  const confirmCopy =
    pendingAction === "set-inactive"
      ? {
          title: "Set user inactive?",
          description: `${user.full_name || user.email} will not be able to sign in until reactivated.`,
          confirmLabel: "Set inactive",
          confirmButtonClassName: "bg-rose-700 text-white hover:bg-rose-800",
        }
      : pendingAction === "set-active"
        ? {
            title: "Set user active?",
            description: `${user.full_name || user.email} will be able to sign in again.`,
            confirmLabel: "Set active",
            confirmButtonClassName: "bg-emerald-700 text-white hover:bg-emerald-800",
          }
        : pendingAction === "delete"
          ? {
              title: "Delete user?",
              description: `This will remove ${user.full_name || user.email} (${user.email}). You may not be able to undo this.`,
              confirmLabel: "Delete",
              confirmButtonClassName: "bg-rose-700 text-white hover:bg-rose-800",
            }
          : null;

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    if (action === "delete") {
      await runDelete();
      return;
    }
    const is_active = action === "set-active";
    await runToggle(is_active);
  };

  return (
    <>
      <ActionsMenu
        align="right"
        trigger={
          <IconButton
            aria-label="Open actions"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="rounded-full"
          >
            <MoreVertical />
          </IconButton>
        }
        items={items}
      />

      <ConfirmDialog
        open={Boolean(confirmCopy)}
        title={confirmCopy?.title ?? ""}
        description={confirmCopy ? <>{confirmCopy.description}</> : null}
        confirmLabel={confirmCopy?.confirmLabel ?? "Confirm"}
        confirmButtonClassName={confirmCopy?.confirmButtonClassName}
        cancelButtonClassName="text-charcoal/80 hover:bg-charcoal/5"
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
