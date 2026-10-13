import "server-only";
import { db } from "../../lib/db";
import type { Tag } from "./types";

export async function listTags(): Promise<Tag[]> {
  return db.tag.findMany({
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
}
