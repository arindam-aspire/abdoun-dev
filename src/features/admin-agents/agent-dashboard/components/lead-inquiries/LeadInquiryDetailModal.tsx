"use client";

import { StickyNote } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { DialogRoot, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button, Label } from "@/components/ui";
import type { LeadInquiry, LeadInquiryNote, LeadStatus } from "@/types/leadInquiry";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(source: string, t: (k: string) => string): string {
  if (source === "contact_form") return t("sourceContactForm");
  if (source === "email") return t("sourceEmail");
  if (source === "phone") return t("sourcePhone");
  if (source === "whatsapp") return t("sourceWhatsapp");
  return source;
}

function statusLabel(status: string, t: (k: string) => string): string {
  if (status === "new") return t("filterNew");
  if (status === "contacted") return t("filterContacted");
  if (status === "closed") return t("filterClosed");
  return status;
}

export interface LeadInquiryDetailModalProps {
  open: boolean;
  lead: LeadInquiry | null;
  notes: LeadInquiryNote[];
  responseText: string;
  noteText: string;
  sending: boolean;
  addingNote: boolean;
  onClose: () => void;
  onResponseChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSendResponse: () => void;
  onAddNote: () => void;
  onStatusChange: (status: LeadStatus) => void;
}

export function LeadInquiryDetailModal({
  open,
  lead,
  notes,
  responseText,
  noteText,
  sending,
  addingNote,
  onClose,
  onResponseChange,
  onNoteChange,
  onSendResponse,
  onAddNote,
  onStatusChange,
}: LeadInquiryDetailModalProps) {
  const t = useTranslations("leadInquiries");

  const statusOptions: LeadStatus[] = ["new", "contacted", "closed"];

  return (
    <DialogRoot open={open} onClose={onClose}>
      <DialogTitle>{t("leadDetail")}</DialogTitle>
      <DialogDescription>
        {lead ? `${lead.propertyName} · ${sourceLabel(lead.source, t)}` : t("loading")}
      </DialogDescription>
      <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
        {lead ? (
          <>
            {(lead.contactName || lead.contactEmail || lead.contactPhone) && (
              <div>
                <p className="text-xs font-medium text-charcoal/65">{t("leadContact")}</p>
                <p className="text-sm text-charcoal mt-0.5">
                  {[lead.contactName, lead.contactEmail, lead.contactPhone]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-charcoal/65">{t("received")}</p>
              <p className="text-sm text-charcoal">{formatDate(lead.dateReceived)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal/65">{t("message")}</p>
              <p className="text-sm text-charcoal mt-1 whitespace-pre-wrap">{lead.message}</p>
            </div>
            {lead.response ? (
              <div>
                <p className="text-xs font-medium text-charcoal/65">{t("yourResponse")}</p>
                <p className="text-sm text-charcoal mt-1 whitespace-pre-wrap">{lead.response}</p>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="lead-response">{t("reply")}</Label>
              <textarea
                id="lead-response"
                value={responseText}
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder={t("replyPlaceholder")}
                rows={3}
                className="w-full rounded-lg border border-subtle bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-charcoal/65">{t("status")}:</span>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(s)}
                  className={`rounded-full border px-2 py-1 text-[11px] font-medium transition ${
                    lead.status === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-subtle bg-surface text-charcoal/80 hover:bg-surface/80"
                  }`}
                >
                  {statusLabel(s, t)}
                </button>
              ))}
            </div>
            <div className="border-t border-subtle pt-4 space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-charcoal">
                <StickyNote className="h-3.5 w-3.5" aria-hidden />
                {t("internalNotes")}
              </h4>
              <p className="text-xs text-charcoal/65">{t("internalNotesDescription")}</p>
              {notes.length > 0 ? (
                <ul className="space-y-2 max-h-32 overflow-y-auto rounded-lg border border-subtle bg-surface p-2">
                  {notes.map((note) => (
                    <li key={note.id} className="text-xs">
                      <span className="font-medium text-charcoal/80">{note.authorName}</span>
                      <span className="text-charcoal/60 mx-1">·</span>
                      <span className="text-charcoal/60">{formatDate(note.createdAt)}</span>
                      <p className="mt-0.5 text-charcoal whitespace-pre-wrap">{note.content}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder={t("addNotePlaceholder")}
                  rows={2}
                  className="flex-1 rounded-lg border border-subtle bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddNote}
                  disabled={addingNote || !noteText.trim()}
                  className="self-end shrink-0"
                >
                  {addingNote ? t("addingNote") : t("addNote")}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-charcoal/70">{t("loading")}</p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("close")}
        </Button>
        <Button
          type="button"
          variant="accent"
          onClick={onSendResponse}
          disabled={sending || !responseText.trim()}
        >
          {sending ? t("sending") : t("sendResponse")}
        </Button>
      </DialogFooter>
    </DialogRoot>
  );
}

