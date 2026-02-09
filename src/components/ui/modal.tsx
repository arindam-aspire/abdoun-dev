"use client";

import type { ReactNode } from "react";
import { DialogRoot } from "./dialog";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <DialogRoot
      open={open}
      onClose={onClose}
      className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white p-0 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-6">
        {title ? (
          <p className="text-sm font-semibold text-slate-900">{title}</p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          Close
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto bg-slate-50 p-3 md:p-4">
        {children}
      </div>
    </DialogRoot>
  );
}

