import "server-only";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import { assertProjectRole, TASK_ACTION_MIN_ROLE } from "../../lib/permissions";
import { getTaskForUser } from "./queries";
import type { Task } from "./types";
import type { CreateTaskInput, SetTaskTagsInput, UpdateTaskInput, UpdateTaskStatusInput } from "./schemas";

async function getTaskProjectId(taskId: string): Promise<string> {
  const task = await db.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
  if (!task) throw new ApiError("NOT_FOUND", "Tarea no encontrada.");
  return task.projectId;
}

async function assertAssigneeIsMember(projectId: string, assigneeId: string | null | undefined): Promise<void> {
  if (!assigneeId) return;
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assigneeId } },
    select: { userId: true },
  });
  if (!member) {
    throw new ApiError("VALIDATION_ERROR", "El responsable debe ser miembro del proyecto.", [
      { path: ["assigneeId"], message: "El responsable debe ser miembro del proyecto." },
    ]);
  }
}

export async function createTask(userId: string, projectId: string, input: CreateTaskInput): Promise<Task> {
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.createTask);
  await assertAssigneeIsMember(projectId, input.assigneeId);

  const task = await db.$transaction(async (tx) => {
    const [project] = await tx.$queryRaw<{ taskSeq: number; codePrefix: string }[]>`
      UPDATE projects SET task_seq = task_seq + 1 WHERE id = ${projectId}
      RETURNING task_seq AS "taskSeq", code_prefix AS "codePrefix"
    `;

    return tx.task.create({
      data: {
        projectId,
        code: `${project.codePrefix}-${project.taskSeq}`,
        title: input.title,
        description: input.description,
        status: input.status ?? "todo",
        priority: input.priority ?? "medium",
        assigneeId: input.assigneeId ?? undefined,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        createdBy: userId,
      },
    });
  });

  return getTaskForUser(userId, task.id);
}

export async function updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
  const projectId = await getTaskProjectId(taskId);
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.editTask);
  if (input.assigneeId !== undefined) await assertAssigneeIsMember(projectId, input.assigneeId);

  await db.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
    },
  });

  return getTaskForUser(userId, taskId);
}

export async function updateTaskStatus(userId: string, taskId: string, input: UpdateTaskStatusInput): Promise<Task> {
  const projectId = await getTaskProjectId(taskId);
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.changeTaskStatus);

  await db.task.update({ where: { id: taskId }, data: { status: input.status } });
  return getTaskForUser(userId, taskId);
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const projectId = await getTaskProjectId(taskId);
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.deleteTask);
  await db.task.delete({ where: { id: taskId } });
}

export async function setTaskTags(userId: string, taskId: string, input: SetTaskTagsInput): Promise<Task> {
  const projectId = await getTaskProjectId(taskId);
  await assertProjectRole(userId, projectId, TASK_ACTION_MIN_ROLE.manageTags);

  await db.$transaction(async (tx) => {
    await tx.taskTag.deleteMany({ where: { taskId } });
    if (input.tagIds.length > 0) {
      await tx.taskTag.createMany({
        data: input.tagIds.map((tagId) => ({ taskId, tagId })),
        skipDuplicates: true,
      });
    }
  });

  return getTaskForUser(userId, taskId);
}
