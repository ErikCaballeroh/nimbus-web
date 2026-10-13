import "server-only";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import { assertProjectRole, PROJECT_ACTION_MIN_ROLE, type Role } from "../../lib/permissions";
import { es } from "../../lib/i18n/es";
import { notify } from "../notifications/service";
import type { AddMemberInput } from "./schemas";

export async function addMember(actorId: string, projectId: string, input: AddMemberInput): Promise<void> {
  await assertProjectRole(actorId, projectId, PROJECT_ACTION_MIN_ROLE.addMember);

  const user = await db.user.findUnique({ where: { id: input.userId }, select: { id: true } });
  if (!user) throw new ApiError("VALIDATION_ERROR", "El usuario no existe.", [{ path: ["userId"], message: "El usuario no existe." }]);

  try {
    await db.projectMember.create({ data: { projectId, userId: input.userId, role: input.role } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ApiError("CONFLICT", "Este usuario ya es miembro del proyecto.");
    }
    throw err;
  }

  const project = await db.project.findUniqueOrThrow({ where: { id: projectId }, select: { name: true } });
  await notify({
    recipientId: input.userId,
    actorId,
    type: "member",
    text: es.notifications.member(project.name),
    projectId,
  });
}

export async function removeMember(actorId: string, projectId: string, targetUserId: string): Promise<void> {
  await assertProjectRole(actorId, projectId, PROJECT_ACTION_MIN_ROLE.removeMember);

  const target = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: { role: true },
  });
  if (!target) throw new ApiError("NOT_FOUND", "El usuario no es miembro de este proyecto.");
  if (target.role === "owner") {
    throw new ApiError("FORBIDDEN", "No se puede quitar al propietario del proyecto.");
  }

  await db.projectMember.delete({ where: { projectId_userId: { projectId, userId: targetUserId } } });
}

export async function changeMemberRole(
  actorId: string,
  projectId: string,
  targetUserId: string,
  newRole: Role
): Promise<void> {
  if (targetUserId === actorId) {
    throw new ApiError("FORBIDDEN", "No puedes cambiar tu propio rol.");
  }

  const actorRole = await assertProjectRole(actorId, projectId, PROJECT_ACTION_MIN_ROLE.changeMemberRole);

  const target = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    select: { role: true },
  });
  if (!target) throw new ApiError("NOT_FOUND", "El usuario no es miembro de este proyecto.");

  // The owner's role can only change as the other half of a transfer below;
  // it can never be revoked outright ("nobody can remove the owner").
  if (target.role === "owner") {
    throw new ApiError("FORBIDDEN", "No se puede cambiar el rol del propietario.");
  }

  if (newRole === "owner") {
    if (actorRole !== "owner") {
      throw new ApiError("FORBIDDEN", "Solo el propietario puede transferir la propiedad.");
    }
    await db.$transaction([
      db.projectMember.update({ where: { projectId_userId: { projectId, userId: actorId } }, data: { role: "admin" } }),
      db.projectMember.update({ where: { projectId_userId: { projectId, userId: targetUserId } }, data: { role: "owner" } }),
    ]);
    return;
  }

  await db.projectMember.update({ where: { projectId_userId: { projectId, userId: targetUserId } }, data: { role: newRole } });
}

function isUniqueConstraintError(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "P2002";
}
