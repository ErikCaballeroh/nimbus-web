import "server-only";
import { db } from "../../lib/db";
import type { TeamMember } from "./types";

/** Users who share at least one project with `userId`, with their total project and task counts. */
export async function getTeamForUser(userId: string): Promise<TeamMember[]> {
  const myProjects = await db.projectMember.findMany({ where: { userId }, select: { projectId: true } });
  const myProjectIds = myProjects.map((m) => m.projectId);
  if (myProjectIds.length === 0) return [];

  const teammates = await db.projectMember.findMany({
    where: { projectId: { in: myProjectIds }, userId: { not: userId } },
    select: { userId: true },
    distinct: ["userId"],
  });
  const teammateIds = teammates.map((t) => t.userId);
  if (teammateIds.length === 0) return [];

  const users = await db.user.findMany({
    where: { id: { in: teammateIds } },
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      _count: { select: { projectMemberships: true, tasksAssigned: true } },
    },
    orderBy: { name: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarColor: u.avatarColor,
    projectCount: u._count.projectMemberships,
    taskCount: u._count.tasksAssigned,
  }));
}
