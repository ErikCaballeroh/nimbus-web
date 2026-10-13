import "server-only";
import { db } from "../../lib/db";
import { ApiError } from "../../lib/api";
import type { UserSummary } from "./types";

const userSummarySelect = { id: true, name: true, email: true, avatarColor: true } as const;

export async function searchUsers(query: string): Promise<UserSummary[]> {
  const q = query.trim();
  if (!q) return [];
  return db.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    select: userSummarySelect,
    orderBy: { name: "asc" },
    take: 10,
  });
}

export async function getUser(id: string): Promise<UserSummary> {
  const user = await db.user.findUnique({ where: { id }, select: userSummarySelect });
  if (!user) throw new ApiError("NOT_FOUND", "Usuario no encontrado.");
  return user;
}
