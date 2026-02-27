/**
 * Agent-only mock: invite acceptance, OTP login, and set password.
 * No admin flows — admin approval is simulated (agent becomes approved after form submit).
 */

export type InviteStatus = "pending" | "approved";

export interface AgentInvite {
  email: string;
  status: InviteStatus;
  name?: string;
  phone?: string;
  serviceArea?: string;
  submittedAt?: number;
}

interface OtpRecord {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

const inviteByToken = new Map<string, AgentInvite>();
const agentPasswords = new Map<string, string>();
const agentOtpChallenges = new Map<string, OtpRecord>();
const setPasswordTokens = new Map<string, string>(); // token -> email

// Seed one invite for testing (admin sends invite — not implemented; agent uses this token)
const DEMO_TOKEN = "demo";
inviteByToken.set(DEMO_TOKEN, {
  email: "agent@abdoun.com",
  status: "pending",
});

function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createOtp() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const EMAIL_TOKEN_PREFIX = "email:";

/** Token used for email-based invite links (invite-agent?email=...). */
export function tokenForEmail(email: string): string {
  return EMAIL_TOKEN_PREFIX + email.trim().toLowerCase();
}

/** Get invite by token (e.g. from email link). For email-based links (invite-agent?email=...), creates a pending invite if missing. */
export async function getInviteByToken(token: string): Promise<AgentInvite | null> {
  await delay(300);
  let invite = inviteByToken.get(token) ?? null;
  if (!invite && token.startsWith(EMAIL_TOKEN_PREFIX)) {
    const email = token.slice(EMAIL_TOKEN_PREFIX.length);
    if (email && email.includes("@")) {
      invite = { email, status: "pending" };
      inviteByToken.set(token, invite);
    }
  }
  return invite;
}

/** Agent accepts invitation: submit Name, Phone, Service Area. After submit, agent is treated as approved (no admin UI). */
export async function acceptInvitation(
  token: string,
  payload: { name: string; phone: string; serviceArea: string }
): Promise<{ success: true; message: string }> {
  await delay(700);
  const invite = inviteByToken.get(token);
  if (!invite) throw new Error("Invitation not found or expired.");
  if (invite.status === "approved" && invite.submittedAt)
    return { success: true, message: "You have already submitted. You can log in via OTP." };

  inviteByToken.set(token, {
    ...invite,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    serviceArea: payload.serviceArea.trim(),
    submittedAt: Date.now(),
    status: "approved", // Simulate admin approval — no admin flow implemented
  });
  return { success: true, message: "Submission received. You can now log in via OTP." };
}

function getApprovedAgentByEmail(email: string): AgentInvite | null {
  const normalized = email.trim().toLowerCase();
  for (const invite of inviteByToken.values()) {
    if (invite.email.toLowerCase() === normalized && invite.status === "approved") return invite;
  }
  return null;
}

/** Request OTP for agent login. Only approved agents (after form submit) can receive OTP. */
export async function requestAgentOtp(email: string): Promise<{
  challengeId: string;
  expiresInSeconds: number;
  debugOtp: string;
  message: string;
}> {
  await delay(600);
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes("@")) throw new Error("Enter a valid email address.");
  const agent = getApprovedAgentByEmail(trimmed);
  if (!agent) throw new Error("No approved agent found for this email. Complete the invitation first.");
  const otp = createOtp();
  const challengeId = createId("agent_otp");
  agentOtpChallenges.set(challengeId, {
    email: agent.email,
    otp,
    expiresAt: Date.now() + 60_000,
    attempts: 0,
  });
  return {
    challengeId,
    expiresInSeconds: 60,
    debugOtp: otp,
    message: "If this email is registered as an agent, a one-time code has been sent.",
  };
}

/** Verify agent OTP. Returns setPasswordToken if agent has not set a password yet. */
export async function verifyAgentOtp(
  challengeId: string,
  otp: string
): Promise<{ success: true; setPasswordToken: string; email: string; name: string }> {
  await delay(600);
  const record = agentOtpChallenges.get(challengeId);
  if (!record) throw new Error("Session not found. Please request a new code.");
  if (record.expiresAt < Date.now()) throw new Error("Code expired. Please request a new code.");
  record.attempts += 1;
  if (record.attempts > 3) throw new Error("Too many invalid attempts.");
  if (record.otp !== otp) throw new Error("Invalid code.");
  agentOtpChallenges.delete(challengeId);
  const setPasswordToken = createId("set_pwd");
  setPasswordTokens.set(setPasswordToken, record.email);
  const agent = getApprovedAgentByEmail(record.email);
  return {
    success: true,
    setPasswordToken,
    email: record.email,
    name: agent?.name ?? "Agent",
  };
}

/** Resend agent OTP. */
export async function resendAgentOtp(challengeId: string): Promise<{ debugOtp: string; expiresInSeconds: number }> {
  await delay(400);
  const existing = agentOtpChallenges.get(challengeId);
  if (!existing) throw new Error("Session not found. Request a new code.");
  const otp = createOtp();
  agentOtpChallenges.set(challengeId, {
    ...existing,
    otp,
    expiresAt: Date.now() + 60_000,
    attempts: 0,
  });
  return { debugOtp: otp, expiresInSeconds: 60 };
}

/** Set password after OTP verification. Returns auth user for login. */
export async function setAgentPassword(
  setPasswordToken: string,
  password: string
): Promise<{ id: string; name: string; email: string; phone: string; role: "agent" }> {
  await delay(500);
  if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");
  const email = setPasswordTokens.get(setPasswordToken);
  if (!email) throw new Error("Session expired. Please complete OTP verification again.");
  setPasswordTokens.delete(setPasswordToken);
  agentPasswords.set(email.toLowerCase(), password);
  const invite = getApprovedAgentByEmail(email);
  return {
    id: "agent_001",
    name: invite?.name ?? "Agent User",
    email: invite?.email ?? email,
    phone: invite?.phone ?? "+962600000001",
    role: "agent",
  };
}
