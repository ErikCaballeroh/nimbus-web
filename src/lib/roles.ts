// Pure role logic, safe to import from Client Components (unlike
// lib/permissions.ts, which also touches the database and is server-only).

export type Role = "viewer" | "editor" | "admin" | "owner";

const ROLE_ORDER: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };

export function hasRole(role: Role, minRole: Role): boolean {
  return ROLE_ORDER[role] >= ROLE_ORDER[minRole];
}

/**
 * Minimum role required for each project action, from README section 3.
 * Invariants that aren't a simple "minimum role" check (only the owner can
 * grant/revoke the owner role, a project always keeps exactly one owner,
 * nobody can remove the owner, a member can't change their own role) are
 * enforced in features/members/service.ts instead.
 */
export const PROJECT_ACTION_MIN_ROLE = {
  viewProject: "viewer",
  editProject: "admin",
  deleteProject: "owner",
  addMember: "admin",
  removeMember: "admin",
  changeMemberRole: "admin",
} as const satisfies Record<string, Role>;

export type ProjectAction = keyof typeof PROJECT_ACTION_MIN_ROLE;

/**
 * Minimum role required for each task/tag/comment action. Not documented as
 * a single-row table in README section 3 (only comment deletion has an
 * explicit rule there); viewers are read-only on a project's tasks.
 */
export const TASK_ACTION_MIN_ROLE = {
  viewTasks: "viewer",
  createTask: "editor",
  editTask: "editor",
  deleteTask: "admin",
  changeTaskStatus: "editor",
  manageTags: "editor",
  addComment: "editor",
  deleteOwnComment: "editor",
  deleteAnyComment: "admin",
} as const satisfies Record<string, Role>;

export type TaskAction = keyof typeof TASK_ACTION_MIN_ROLE;
