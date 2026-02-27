"use client";

import { notFound } from "next/navigation";

/**
 * /agent-invite/[token] is restricted. Use /invite-agent/[token] or /invite-agent?email=... instead.
 */
export default function AgentInviteRestrictedPage() {
  notFound();
}
