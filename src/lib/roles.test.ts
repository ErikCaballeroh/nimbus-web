import { describe, expect, it } from "vitest";
import { hasRole, PROJECT_ACTION_MIN_ROLE, type Role } from "./roles";

const ROLES: Role[] = ["viewer", "editor", "admin", "owner"];

describe("hasRole", () => {
  it("orders roles viewer < editor < admin < owner", () => {
    expect(hasRole("viewer", "editor")).toBe(false);
    expect(hasRole("editor", "viewer")).toBe(true);
    expect(hasRole("editor", "admin")).toBe(false);
    expect(hasRole("admin", "editor")).toBe(true);
    expect(hasRole("admin", "owner")).toBe(false);
    expect(hasRole("owner", "admin")).toBe(true);
  });

  it("a role always satisfies itself as the minimum", () => {
    for (const role of ROLES) {
      expect(hasRole(role, role)).toBe(true);
    }
  });

  it.each(Object.entries(PROJECT_ACTION_MIN_ROLE))("every role at or above the minimum for %s is allowed, below is not", (_action, minRole) => {
    for (const role of ROLES) {
      expect(hasRole(role, minRole)).toBe(ROLES.indexOf(role) >= ROLES.indexOf(minRole));
    }
  });
});
