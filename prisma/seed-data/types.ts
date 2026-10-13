// Shapes for prisma/seed.ts's fixture data (named "Mock*" since this data
// originally came from the Figma mocks, before phases 3-7 moved the app to
// real DB-backed data). Kept separate from features/projects/types.ts, features/members/types.ts,
// features/tasks/types.ts and features/notifications/types.ts, which
// describe the real, DB-backed features wired up in phases 5-7 — the two
// had diverged (e.g. a project's members have one global mock role here,
// vs. a per-project role in the real feature; a mock task embeds its
// comments and plain-string tags, vs. the real feature's separate comments
// endpoint and Tag objects).
export type MockRole = "owner" | "admin" | "editor" | "viewer";

export type MockNotificationType = "assigned" | "comment" | "status" | "member" | "due";

export interface MockNotification {
  id: string;
  type: MockNotificationType;
  actorId: string;
  text: string;
  time: string;
  read: boolean;
  projectId?: string;
}

export interface MockComment {
  id: string;
  authorId: string;
  text: string;
  time: string;
}

export interface MockTask {
  id: string;
  code: string;
  title: string;
  description: string;
  status: MockStatus;
  priority: MockPriority;
  assigneeId: string | null;
  due: string; // ISO
  projectId: string;
  comments: MockComment[];
  tags: string[];
}

export type MockStatus = "todo" | "in_progress" | "review" | "done";
export type MockPriority = "low" | "medium" | "high" | "urgent";

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
