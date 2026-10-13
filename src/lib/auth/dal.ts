import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { CurrentUser } from "@/features/auth/types";
import { getSessionUserId } from "./session";

/** Cached per request. Returns null when there is no valid session. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarColor: true, theme: true },
  });
  return user;
});
