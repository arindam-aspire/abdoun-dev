"use client";

type UndoArchiveToastProps = {
  open: boolean;
  onUndo: () => void | Promise<void>;
};

export function UndoArchiveToast({ open, onUndo }: UndoArchiveToastProps) {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-amber-900">Notification archived.</p>
        <button
          type="button"
          onClick={() => void onUndo()}
          className="inline-flex items-center rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
        >
          Unarchive
        </button>
      </div>
    </div>
  );
}
