'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { members as seedMembers } from "../lib/mock/members";
import { projects as seedProjects } from "../lib/mock/projects";
import { tasks as seedTasks } from "../lib/mock/tasks";
import { notifications as seedNotifs } from "../lib/mock/notifications";
import type { MockProject, MockMember } from "../lib/mock/types";
import type { Task, Status } from "../features/tasks/types";
import type { Notification } from "../features/notifications/types";

interface Store {
  projects: MockProject[];
  tasks: Task[];
  members: MockMember[];
  notifications: Notification[];
  addTask: (t: Omit<Task, "id" | "code" | "comments">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  moveTask: (id: string, status: Status) => void;
  addComment: (taskId: string, text: string) => void;
  importTasks: (projectId: string, rows: { title: string; priority: Task["priority"]; status: Status }[]) => void;
  markAllRead: () => void;
  toggleRead: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

let seq = 900;
const uid = (p: string) => p + ++seq;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects] = useState(seedProjects);
  const [tasks, setTasks] = useState(seedTasks);
  const [members] = useState(seedMembers);
  const [notifications, setNotifications] = useState(seedNotifs);

  const value = useMemo<Store>(
    () => ({
      projects,
      tasks,
      members,
      notifications,
      addTask: (t) =>
        setTasks((cur) => [
          { ...t, id: uid("t"), code: "NIM-" + seq, comments: [] },
          ...cur,
        ]),
      updateTask: (id, patch) =>
        setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      moveTask: (id, status) =>
        setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, status } : t))),
      addComment: (taskId, text) =>
        setTasks((cur) =>
          cur.map((t) =>
            t.id === taskId
              ? {
                ...t,
                comments: [
                  ...t.comments,
                  { id: uid("c"), authorId: "u1", text, time: new Date("2026-09-01T10:00:00").toISOString() },
                ],
              }
              : t
          )
        ),
      importTasks: (projectId, rows) =>
        setTasks((cur) => [
          ...rows.map((r) => ({
            id: uid("t"),
            code: "NIM-" + seq,
            title: r.title,
            description: "",
            status: r.status,
            priority: r.priority,
            assigneeId: null,
            due: "2026-09-30",
            projectId,
            comments: [],
            tags: [] as string[],
          })),
          ...cur,
        ]),
      markAllRead: () => setNotifications((cur) => cur.map((n) => ({ ...n, read: true }))),
      toggleRead: (id) =>
        setNotifications((cur) => cur.map((n) => (n.id === id ? { ...n, read: !n.read } : n))),
    }),
    [projects, tasks, members, notifications]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
