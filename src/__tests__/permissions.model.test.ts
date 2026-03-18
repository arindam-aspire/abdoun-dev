import { derivePermissionsFromSession, PERMISSIONS } from "@/permissions/model";

describe("permissions/model", () => {
  it("returns public with no permissions when session is null", () => {
    const result = derivePermissionsFromSession(null);
    expect(result.role).toBe("public");
    expect(Array.from(result.permissions)).toEqual([]);
  });

  it("returns agent permissions for agent session", () => {
    const result = derivePermissionsFromSession({
      user: { id: "1", name: "A", email: "a@a", role: "agent" },
      role: "agent",
    });
    expect(result.role).toBe("agent");
    expect(result.permissions.has(PERMISSIONS.VIEW_AGENT_DASHBOARD)).toBe(true);
  });

  it("returns admin permissions for admin session", () => {
    const result = derivePermissionsFromSession({
      user: { id: "1", name: "A", email: "a@a", role: "admin" },
      role: "admin",
    });
    expect(result.role).toBe("admin");
    expect(result.permissions.has(PERMISSIONS.VIEW_ADMIN_DASHBOARD)).toBe(true);
    expect(result.permissions.has(PERMISSIONS.MANAGE_AGENTS)).toBe(true);
    expect(result.permissions.has(PERMISSIONS.MANAGE_PROPERTIES)).toBe(true);
  });
});

