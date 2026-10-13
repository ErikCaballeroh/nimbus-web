import "server-only";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import type { Project, ProjectListItem } from "./types";

export async function listProjectsForUser(userId: string): Promise<ProjectListItem[]> {
  const memberships = await db.projectMember.findMany({
    where: { userId },
    select: {
      role: true,
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          members: { select: { user: { select: { id: true, name: true, avatarColor: true } } } },
          tasks: { select: { status: true } },
        },
      },
    },
    orderBy: { project: { name: "asc" } },
  });

  return memberships.map(({ role, project }) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    startDate: project.startDate?.toISOString() ?? null,
    endDate: project.endDate?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    myRole: role,
    members: project.members.map((m) => m.user),
    taskCount: project.tasks.length,
    doneTaskCount: project.tasks.filter((t) => t.status === "done").length,
  }));
}

/** Throws NOT_FOUND when the project doesn't exist or the user isn't a member (never leaks existence). */
export async function getProjectForUser(userId: string, projectId: string): Promise<Project> {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: {
      role: true,
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          createdBy: true,
        },
      },
    },
  });
  if (!member) throw new ApiError("NOT_FOUND", "Proyecto no encontrado.");

  const { project, role } = member;
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    startDate: project.startDate?.toISOString() ?? null,
    endDate: project.endDate?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    createdBy: project.createdBy,
    myRole: role,
  };
}
