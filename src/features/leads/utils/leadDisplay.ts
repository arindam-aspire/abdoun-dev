import type { LeadSource } from "@/types/lead";

const SOURCE_LABELS: Record<string, string> = {
  OFFLINE_MANUAL: "Offline",
  AGENT_MANUAL: "Offline",
  MANUAL_ADMIN: "Manual",
  EMAIL_FORM: "Email",
  PHONE: "Phone",
  WHATSAPP: "WhatsApp",
  FACEBOOK: "Facebook",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
};

export function getLeadSourceLabel(source: LeadSource | "all" | string): string {
  if (source === "all") return "All";
  const key = String(source ?? "").trim().toUpperCase();
  return SOURCE_LABELS[key] ?? key.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
