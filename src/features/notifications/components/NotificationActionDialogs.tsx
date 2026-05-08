"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Target = { id: string; title: string } | null;

type NotificationActionDialogsProps = {
  archivingNotification: Target;
  deletingNotification: Target;
  onCancelArchive: () => void;
  onConfirmArchive: () => void | Promise<void>;
  onCancelDelete: () => void;
  onConfirmDelete: () => void | Promise<void>;
};

export function NotificationActionDialogs({
  archivingNotification,
  deletingNotification,
  onCancelArchive,
  onConfirmArchive,
  onCancelDelete,
  onConfirmDelete,
}: NotificationActionDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={Boolean(archivingNotification)}
        onCancel={onCancelArchive}
        onConfirm={onConfirmArchive}
        title="Archive notification"
        description={
          archivingNotification
            ? `Archive "${archivingNotification.title}"? You can still access archived notifications later.`
            : "Archive this notification? You can still access archived notifications later."
        }
        confirmLabel="Archive"
        loadingConfirmLabel="Archiving..."
        cancelLabel="Cancel"
        confirmButtonClassName="bg-amber-600 text-white hover:bg-amber-700"
      />
      <ConfirmDialog
        open={Boolean(deletingNotification)}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
        title="Delete notification"
        description={
          deletingNotification
            ? `Are you sure you want to delete "${deletingNotification.title}"?`
            : "Are you sure you want to delete this notification?"
        }
        confirmLabel="Delete"
        loadingConfirmLabel="Deleting..."
        cancelLabel="Cancel"
        confirmButtonClassName="bg-rose-700 text-white hover:bg-rose-800"
      />
    </>
  );
}
