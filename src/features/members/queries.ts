import "server-only";
import { db } from "@/lib/db";
import { assertProjectRole, PROJECT_ACTION_MIN_ROLE } from "@/lib/permissions";
import type { ProjectMember } from "./types";

export async function listProjectMembers(userId: string, projectId: string): Promise<ProjectMember[]> {
  await assertProjectRole(userId, projectId, PROJECT_ACTION_MIN_ROLE.viewProject);

  const members = await db.projectMember.findMany({
    where: { projectId },
    select: {
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, email: true, avatarColor: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  // owner first, then admin, editor, viewer.
  const order: Record<string, number> = { owner: 0, admin: 1, editor: 2, viewer: 3 };
  return members
    .map((m) => ({
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarColor: m.user.avatarColor,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }))
    .sort((a, b) => order[a.role] - order[b.role] || a.name.localeCompare(b.name));
}
