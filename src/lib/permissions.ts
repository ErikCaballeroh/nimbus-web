import "server-only";
import { db } from "./db";
import { ApiError } from "./api";
import { hasRole, type Role } from "./roles";

export {
  hasRole,
  PROJECT_ACTION_MIN_ROLE,
  TASK_ACTION_MIN_ROLE,
  type ProjectAction,
  type TaskAction,
  type Role,
} from "./roles";

/**
 * Throws NOT_FOUND when the user isn't a member of the project (so
 * membership is never leaked to non-members) and FORBIDDEN when their role
 * is below `minRole`. Returns the member's role otherwise.
 */
export async function assertProjectRole(userId: string, projectId: string, minRole: Role): Promise<Role> {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
  if (!member) {
    throw new ApiError("NOT_FOUND", "Proyecto no encontrado.");
  }
  if (!hasRole(member.role, minRole)) {
    throw new ApiError("FORBIDDEN", "No tienes permiso para realizar esta acción.");
  }
  return member.role;
}
