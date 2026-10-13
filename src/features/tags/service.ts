import "server-only";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import type { Tag } from "./types";
import type { CreateTagInput } from "./schemas";

export async function createTag(input: CreateTagInput): Promise<Tag> {
  try {
    return await db.tag.create({
      data: { name: input.name, color: input.color },
      select: { id: true, name: true, color: true },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new ApiError("CONFLICT", "Ya existe una etiqueta con ese nombre.");
    }
    throw err;
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  return !!err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "P2002";
}

/** Resolves tag names to Tag rows, creating any that don't exist yet. */
export async function findOrCreateTagsByName(names: string[]): Promise<Tag[]> {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const existing = await db.tag.findMany({
    where: { name: { in: unique } },
    select: { id: true, name: true, color: true },
  });
  const missing = unique.filter((name) => !existing.some((tag) => tag.name === name));

  const created = await Promise.all(
    missing.map(async (name) => {
      try {
        return await createTag({ name });
      } catch (err) {
        if (err instanceof ApiError && err.code === "CONFLICT") {
          // Lost a create race to a concurrent import row — just re-read it.
          return db.tag.findUniqueOrThrow({ where: { name }, select: { id: true, name: true, color: true } });
        }
        throw err;
      }
    })
  );

  return [...existing, ...created];
}
