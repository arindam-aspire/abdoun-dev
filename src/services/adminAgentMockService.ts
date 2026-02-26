export type AdminAgentStatus = "active" | "invited" | "suspended";

export interface AdminAgent {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: AdminAgentStatus;
  invitedAt: string;
  invitedBy: string;
}

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const nowIso = () => new Date().toISOString();

let agentsDb: AdminAgent[] = [
  {
    id: "agt_001",
    fullName: "Leen Khoury",
    email: "leen.khoury@abdoun.com",
    phone: "+962790000111",
    city: "Amman",
    status: "active",
    invitedAt: "2026-01-11T09:15:00.000Z",
    invitedBy: "Admin User",
  },
  {
    id: "agt_002",
    fullName: "Omar Shdeifat",
    email: "omar.shdeifat@abdoun.com",
    phone: "+962790000222",
    city: "Amman",
    status: "active",
    invitedAt: "2026-01-22T11:30:00.000Z",
    invitedBy: "Admin User",
  },
  {
    id: "agt_003",
    fullName: "Dana Abu-Taleb",
    email: "dana.abutaleb@abdoun.com",
    phone: "+962790000333",
    city: "Irbid",
    status: "invited",
    invitedAt: "2026-02-10T14:05:00.000Z",
    invitedBy: "Admin User",
  },
];

export async function fetchAdminAgentsMock(): Promise<AdminAgent[]> {
  await delay();
  return [...agentsDb].sort(
    (a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime(),
  );
}

export async function inviteAgentByEmailMock(
  email: string,
  invitedBy: string,
): Promise<AdminAgent> {
  await delay(700);
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  const exists = agentsDb.some((agent) => agent.email.toLowerCase() === normalizedEmail);
  if (exists) {
    throw new Error("An agent with this email already exists.");
  }

  const local = normalizedEmail.split("@")[0] ?? "";
  const nameFromEmail = local
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

  const newAgent: AdminAgent = {
    id: `agt_${Math.random().toString(36).slice(2, 10)}`,
    fullName: nameFromEmail || "Invited Agent",
    email: normalizedEmail,
    phone: "-",
    city: "-",
    status: "invited",
    invitedAt: nowIso(),
    invitedBy,
  };

  agentsDb = [newAgent, ...agentsDb];
  return newAgent;
}
