'use client';

import { createContext, useContext, type ReactNode } from "react";
import type { CurrentUser } from "./types";

const Ctx = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>;
}

export function useCurrentUser(): CurrentUser {
  const user = useContext(Ctx);
  if (!user) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return user;
}
