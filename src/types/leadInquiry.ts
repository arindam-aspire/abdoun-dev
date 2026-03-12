/** Lead inquiries = inquiries from contact form, email, phone, or WhatsApp on a property. */

export type LeadInquirySource =
  | "contact_form"   // Site contact form
  | "email"          // Email link on property
  | "phone"          // Phone call / click-to-call on property
  | "whatsapp";     // WhatsApp link on property

export type LeadStatus = "new" | "contacted" | "closed";

export interface LeadInquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  /** How the lead reached out. */
  source: LeadInquirySource;
  dateReceived: string;
  status: LeadStatus;
  /** Message or summary (e.g. "Interested in viewing", or call duration). */
  message: string;
  response?: string;
  respondedAt?: string;
  /** Contact info (from form or channel). */
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  /** Last activity (response or note). */
  lastActivityAt?: string;
}

/** Internal note on a lead (agent-only). */
export interface LeadInquiryNote {
  id: string;
  leadId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
