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
