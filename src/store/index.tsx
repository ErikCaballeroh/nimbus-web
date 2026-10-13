'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { members as seedMembers } from "@/lib/mock/members";
import { projects as seedProjects } from "@/lib/mock/projects";
import { tasks as seedTasks } from "@/lib/mock/tasks";
import { notifications as seedNotifs } from "@/lib/mock/notifications";
import type { MockProject, MockMember, MockTask, MockNotification } from "@/lib/mock/types";

// Nothing reads this store anymore as of phase 7 (Dashboard/Header/
// Notifications all moved to real data); kept only because phase 9 is where
// docs/ROADMAP.md schedules deleting lib/mock/ and this provider together.
interface Store {
  projects: MockProject[];
  tasks: MockTask[];
  members: MockMember[];
  notifications: MockNotification[];
  markAllRead: () => void;
  toggleRead: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects] = useState(seedProjects);
  const [tasks] = useState(seedTasks);
  const [members] = useState(seedMembers);
  const [notifications, setNotifications] = useState(seedNotifs);

  const value = useMemo<Store>(
    () => ({
      projects,
      tasks,
      members,
      notifications,
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
