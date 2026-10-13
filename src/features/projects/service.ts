import "server-only";
import { db } from "../../lib/db";
import { assertProjectRole, PROJECT_ACTION_MIN_ROLE } from "../../lib/permissions";
import { getProjectForUser } from "./queries";
import type { Project } from "./types";
import type { CreateProjectInput, UpdateProjectInput } from "./schemas";

export async function createProject(userId: string, input: CreateProjectInput): Promise<Project> {
  const project = await db.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        name: input.name,
        description: input.description,
        color: input.color,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        createdBy: userId,
      },
    });
    await tx.projectMember.create({
      data: { projectId: created.id, userId, role: "owner" },
    });
    return created;
  });

  return getProjectForUser(userId, project.id);
}

export async function updateProject(userId: string, projectId: string, input: UpdateProjectInput): Promise<Project> {
  await assertProjectRole(userId, projectId, PROJECT_ACTION_MIN_ROLE.editProject);

  await db.project.update({
    where: { id: projectId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
      ...(input.endDate !== undefined ? { endDate: new Date(input.endDate) } : {}),
    },
  });

  return getProjectForUser(userId, projectId);
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await assertProjectRole(userId, projectId, PROJECT_ACTION_MIN_ROLE.deleteProject);
  await db.project.delete({ where: { id: projectId } });
}
