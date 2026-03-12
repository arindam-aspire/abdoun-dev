/**
 * Lead Inquiries mock service.
 * Leads = inquiries from contact form, email, phone, or WhatsApp on a property.
 */

import type { LeadInquiry, LeadInquiryNote, LeadInquirySource, LeadStatus } from "@/types/leadInquiry";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

const leadsStore: LeadInquiry[] = [
  { id: "LD1", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", source: "contact_form", dateReceived: isoDaysAgo(0), status: "new", message: "Is the villa still available? Interested in viewing.", contactName: "Ahmad Hassan", contactEmail: "ahmad.h@example.com", contactPhone: "+962 79 123 4567" },
  { id: "LD2", propertyId: "L2", propertyName: "Apartment Sweifieh", source: "email", dateReceived: isoDaysAgo(1), status: "contacted", message: "What are the monthly fees?", response: "Fees are JOD 45/month.", respondedAt: isoDaysAgo(0), lastActivityAt: isoDaysAgo(0), contactName: "Sara Mahmoud", contactEmail: "sara.m@example.com" },
  { id: "LD3", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", source: "phone", dateReceived: isoDaysAgo(2), status: "contacted", message: "Call: discussed price and viewing. Callback agreed.", contactName: "Omar Khalil", contactPhone: "+962 77 234 5678", lastActivityAt: isoDaysAgo(2) },
  { id: "LD4", propertyId: "L5", propertyName: "Penthouse, Fifth Circle", source: "whatsapp", dateReceived: isoDaysAgo(0), status: "new", message: "Schedule a visit please.", contactName: "Kareem", contactPhone: "+962 78 111 2233" },
  { id: "LD5", propertyId: "L3", propertyName: "Office Space, Shmeisani", source: "contact_form", dateReceived: isoDaysAgo(3), status: "contacted", message: "Is parking included? Lease terms?", response: "Yes, 2 spaces. Sent lease summary.", respondedAt: isoDaysAgo(2), lastActivityAt: isoDaysAgo(2), contactName: "Business Co", contactEmail: "lease@business.com", contactPhone: "+962 6 500 1234" },
  { id: "LD6", propertyId: "L7", propertyName: "Family House, Khalda", source: "email", dateReceived: isoDaysAgo(4), status: "new", message: "Availability from next month?", contactName: "Layla Nasser", contactEmail: "layla.n@example.com" },
  { id: "LD7", propertyId: "L2", propertyName: "Apartment Sweifieh", source: "contact_form", dateReceived: isoDaysAgo(5), status: "contacted", message: "Thanks, we found another.", contactEmail: "sara.m@example.com", lastActivityAt: isoDaysAgo(5) },
  { id: "LD8", propertyId: "L8", propertyName: "Duplex, Dabouq", source: "whatsapp", dateReceived: isoDaysAgo(1), status: "new", message: "Send floor plan and more photos.", contactName: "Youssef Ali", contactPhone: "+962 79 555 6677" },
  { id: "LD9", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", source: "phone", dateReceived: isoDaysAgo(6), status: "contacted", message: "Call: asked best price. Said will discuss with spouse.", contactPhone: "+962 77 234 5678", lastActivityAt: isoDaysAgo(5) },
  { id: "LD10", propertyId: "L10", propertyName: "Garden Apartment, Um Uthaina", source: "contact_form", dateReceived: isoDaysAgo(0), status: "new", message: "Pet friendly? What's the policy?", contactName: "Nadia Fawzi", contactEmail: "nadia.f@example.com" },
  { id: "LD11", propertyId: "L5", propertyName: "Penthouse, Fifth Circle", source: "email", dateReceived: isoDaysAgo(7), status: "closed", message: "Deal closed.", contactName: "Kareem Jaber", contactEmail: "kareem.j@example.com", lastActivityAt: isoDaysAgo(6) },
  { id: "LD12", propertyId: "L3", propertyName: "Office Space, Shmeisani", source: "phone", dateReceived: isoDaysAgo(2), status: "new", message: "Missed call. Voicemail: lease terms?", contactPhone: "+962 6 555 0000" },
  { id: "LD13", propertyId: "L7", propertyName: "Family House, Khalda", source: "contact_form", dateReceived: isoDaysAgo(8), status: "contacted", message: "Viewing this week?", response: "Thursday 3pm works.", respondedAt: isoDaysAgo(7), lastActivityAt: isoDaysAgo(7), contactName: "Layla Nasser", contactEmail: "layla.n@example.com" },
  { id: "LD14", propertyId: "L8", propertyName: "Duplex, Dabouq", source: "whatsapp", dateReceived: isoDaysAgo(9), status: "new", message: "Photos of kitchen and balcony?", contactName: "Youssef Ali", contactPhone: "+962 79 555 6677" },
  { id: "LD15", propertyId: "L2", propertyName: "Apartment Sweifieh", source: "email", dateReceived: isoDaysAgo(1), status: "new", message: "Is it furnished?", contactEmail: "new.lead@example.com" },
  { id: "LD16", propertyId: "L10", propertyName: "Garden Apartment, Um Uthaina", source: "contact_form", dateReceived: isoDaysAgo(10), status: "closed", message: "No longer interested.", contactName: "Nadia Fawzi", contactEmail: "nadia.f@example.com", lastActivityAt: isoDaysAgo(10) },
  { id: "LD17", propertyId: "L1", propertyName: "Villa Abdoun, 4BR", source: "contact_form", dateReceived: isoDaysAgo(3), status: "new", message: "Bank financing possible? Budget 400k.", contactName: "Ahmad Hassan", contactEmail: "ahmad.h@example.com" },
  { id: "LD18", propertyId: "L5", propertyName: "Penthouse, Fifth Circle", source: "whatsapp", dateReceived: isoDaysAgo(11), status: "closed", message: "Amenities list?", response: "Pool, gym, concierge.", respondedAt: isoDaysAgo(10), lastActivityAt: isoDaysAgo(10), contactName: "Kareem Jaber", contactPhone: "+962 78 111 2233" },
  { id: "LD19", propertyId: "L3", propertyName: "Office Space, Shmeisani", source: "email", dateReceived: isoDaysAgo(4), status: "new", message: "Square footage and layout?", contactEmail: "office@example.com" },
  { id: "LD20", propertyId: "L7", propertyName: "Family House, Khalda", source: "phone", dateReceived: isoDaysAgo(0), status: "new", message: "Incoming call. School district?", contactName: "Family Buyer", contactPhone: "+962 78 345 6789" },
];

const leadNotesStore: LeadInquiryNote[] = [
  { id: "LN1", leadId: "LD1", authorName: "Agent", content: "Called back, viewing scheduled for Saturday.", createdAt: isoDaysAgo(0) },
  { id: "LN2", leadId: "LD2", authorName: "Agent", content: "Sent fee breakdown. Waiting for decision.", createdAt: isoDaysAgo(0) },
  { id: "LN3", leadId: "LD5", authorName: "Agent", content: "Sent parking details and lease addendum.", createdAt: isoDaysAgo(2) },
];

export function getLeadInquiries(): Promise<LeadInquiry[]> {
  return Promise.resolve(
    [...leadsStore].sort((a, b) => b.dateReceived.localeCompare(a.dateReceived))
  );
}

export function getLeadInquiryById(id: string): Promise<LeadInquiry | null> {
  return Promise.resolve(leadsStore.find((l) => l.id === id) ?? null);
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadInquiry | null> {
  const idx = leadsStore.findIndex((l) => l.id === id);
  if (idx === -1) return Promise.resolve(null);
  leadsStore[idx] = { ...leadsStore[idx], status };
  return Promise.resolve(leadsStore[idx]);
}

export function addLeadResponse(id: string, response: string): Promise<LeadInquiry | null> {
  const idx = leadsStore.findIndex((l) => l.id === id);
  if (idx === -1) return Promise.resolve(null);
  const now = isoNow();
  leadsStore[idx] = {
    ...leadsStore[idx],
    response,
    respondedAt: now.slice(0, 10),
    lastActivityAt: now,
    status: "contacted" as LeadStatus,
  };
  return Promise.resolve(leadsStore[idx]);
}

export function getLeadNotes(leadId: string): Promise<LeadInquiryNote[]> {
  const notes = leadNotesStore
    .filter((n) => n.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.resolve([...notes]);
}

let nextNoteId = leadNotesStore.length + 1;

export function addLeadNote(
  leadId: string,
  content: string,
  authorName: string = "Agent"
): Promise<LeadInquiryNote | null> {
  const lead = leadsStore.find((l) => l.id === leadId);
  if (!lead) return Promise.resolve(null);
  const now = isoNow();
  const note: LeadInquiryNote = {
    id: `LN${nextNoteId++}`,
    leadId,
    authorName,
    content: content.trim(),
    createdAt: now,
  };
  leadNotesStore.push(note);
  const idx = leadsStore.findIndex((l) => l.id === leadId);
  if (idx !== -1) leadsStore[idx] = { ...leadsStore[idx], lastActivityAt: now };
  return Promise.resolve(note);
}
