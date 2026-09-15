'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  projects as seedProjects,
  tasks as seedTasks,
  members as seedMembers,
  notifications as seedNotifs,
  type Project,
  type Task,
  type Member,
  type Notification,
  type Status,
} from "../lib/data";

type Theme = "light" | "dark";

interface Store {
  theme: Theme;
  toggleTheme: () => void;
  projects: Project[];
  tasks: Task[];
  members: Member[];
  notifications: Notification[];
  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addTask: (t: Omit<Task, "id" | "code" | "comments">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  moveTask: (id: string, status: Status) => void;
  addComment: (taskId: string, text: string) => void;
  importTasks: (projectId: string, rows: { title: string; priority: Task["priority"]; status: Status }[]) => void;
  markAllRead: () => void;
  toggleRead: (id: string) => void;
  addMember: (m: Omit<Member, "id">, projectId: string) => void;
}

const Ctx = createContext<Store | null>(null);

let seq = 900;
const uid = (p: string) => p + ++seq;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [projects, setProjects] = useState(seedProjects);
  const [tasks, setTasks] = useState(seedTasks);
  const [members, setMembers] = useState(seedMembers);
  const [notifications, setNotifications] = useState(seedNotifs);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<Store>(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      projects,
      tasks,
      members,
      notifications,
      addProject: (p) =>
        setProjects((cur) => [
          { ...p, id: uid("p"), createdAt: new Date("2026-09-01").toISOString() },
          ...cur,
        ]),
      updateProject: (id, patch) =>
        setProjects((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p))),
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
      addMember: (m, projectId) => {
        const id = uid("u");
        setMembers((cur) => [...cur, { ...m, id }]);
        setProjects((cur) =>
          cur.map((p) => (p.id === projectId ? { ...p, memberIds: [...p.memberIds, id] } : p))
        );
      },
    }),
    [theme, projects, tasks, members, notifications]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used within StoreProvider");
  return s;
}
