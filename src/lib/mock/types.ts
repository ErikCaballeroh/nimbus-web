// Shapes for the mock data that still backs the Board and Dashboard
// screens (phases 6-7). Kept separate from features/projects/types.ts and
// features/members/types.ts, which now describe the real, DB-backed
// Projects/Members feature wired up in phase 5 — the two have diverged
// (e.g. a project's members have one global mock role here, vs. a
// per-project role in the real feature).
export type MockRole = "owner" | "admin" | "editor" | "viewer";

export interface MockMember {
  id: string;
  name: string;
  email: string;
  role: MockRole;
  color: string;
}

export interface MockProject {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  start: string;
  end: string;
  createdAt: string;
}
