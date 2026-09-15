export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "todo" | "in_progress" | "review" | "done";
export type Role = "Propietario" | "Administrador" | "Editor" | "Lector";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  time: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  due: string; // ISO
  projectId: string;
  comments: Comment[];
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  start: string;
  end: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "assigned" | "comment" | "status" | "member" | "due";
  actorId: string;
  text: string;
  time: string;
  read: boolean;
  projectId?: string;
}

export const priorityMeta: Record<Priority, { label: string; token: string }> = {
  low: { label: "Baja", token: "var(--prio-low)" },
  medium: { label: "Media", token: "var(--prio-medium)" },
  high: { label: "Alta", token: "var(--prio-high)" },
  urgent: { label: "Urgente", token: "var(--prio-urgent)" },
};

export const statusMeta: Record<Status, { label: string; accent: string }> = {
  todo: { label: "Pendiente", accent: "#94a3b8" },
  in_progress: { label: "En Progreso", accent: "#4f46e5" },
  review: { label: "Revisión", accent: "#d97706" },
  done: { label: "Completado", accent: "#16a34a" },
};

export const statusOrder: Status[] = ["todo", "in_progress", "review", "done"];

export const members: Member[] = [
  { id: "u1", name: "Ana García", email: "ana.garcia@nimbus.io", role: "Propietario", color: "#4f46e5" },
  { id: "u2", name: "Carlos Ruiz", email: "carlos.ruiz@nimbus.io", role: "Administrador", color: "#0891b2" },
  { id: "u3", name: "Laura Martínez", email: "laura.martinez@nimbus.io", role: "Editor", color: "#db2777" },
  { id: "u4", name: "Javier Pérez", email: "javier.perez@nimbus.io", role: "Editor", color: "#16a34a" },
  { id: "u5", name: "Sofía Gómez", email: "sofia.gomez@nimbus.io", role: "Lector", color: "#ea580c" },
];

export const currentUserId = "u1";

export const projects: Project[] = [
  {
    id: "p1",
    name: "Sitio Web Corporativo",
    description: "Rediseño completo del sitio institucional con nuevo CMS y sistema de diseño.",
    color: "#4f46e5",
    memberIds: ["u1", "u2", "u3", "u4"],
    start: "2026-07-01",
    end: "2026-10-15",
    createdAt: "2026-06-24",
  },
  {
    id: "p2",
    name: "App Móvil",
    description: "Aplicación iOS y Android para clientes con sincronización en tiempo real.",
    color: "#0891b2",
    memberIds: ["u1", "u3", "u5"],
    start: "2026-08-05",
    end: "2026-12-20",
    createdAt: "2026-07-30",
  },
  {
    id: "p3",
    name: "Dashboard Ventas",
    description: "Panel analítico con métricas de ventas y previsión de ingresos.",
    color: "#db2777",
    memberIds: ["u1", "u2", "u4", "u5"],
    start: "2026-06-15",
    end: "2026-09-30",
    createdAt: "2026-06-10",
  },
  {
    id: "p4",
    name: "Rediseño Marketing",
    description: "Nueva identidad de marca, campañas y materiales para el Q4.",
    color: "#16a34a",
    memberIds: ["u1", "u3"],
    start: "2026-08-20",
    end: "2026-11-10",
    createdAt: "2026-08-18",
  },
];

let taskSeq = 100;
function mkTask(p: Partial<Task> & { title: string; status: Status; priority: Priority; projectId: string }): Task {
  taskSeq++;
  return {
    id: "t" + taskSeq,
    code: "NIM-" + taskSeq,
    description: "",
    assigneeId: null,
    due: "2026-09-20",
    comments: [],
    tags: [],
    ...p,
  };
}

export const tasks: Task[] = [
  mkTask({ title: "Diseñar wireframes", status: "done", priority: "medium", projectId: "p1", assigneeId: "u3", due: "2026-08-12", tags: ["Diseño"], description: "Wireframes de baja fidelidad para las 6 páginas clave.", comments: [{ id: "c1", authorId: "u1", text: "Excelente base, aprobado ✅", time: "2026-08-11T10:20:00" }] }),
  mkTask({ title: "Implementar autenticación", status: "in_progress", priority: "high", projectId: "p1", assigneeId: "u4", due: "2026-09-05", tags: ["Backend"], description: "Login, registro y recuperación con JWT y refresh tokens." }),
  mkTask({ title: "Revisión de UI", status: "review", priority: "medium", projectId: "p1", assigneeId: "u3", due: "2026-09-08", tags: ["Diseño", "QA"], description: "Revisar consistencia de componentes y estados." }),
  mkTask({ title: "Testing QA", status: "todo", priority: "high", projectId: "p1", assigneeId: "u2", due: "2026-09-15", tags: ["QA"], description: "Plan de pruebas end-to-end en Cypress." }),
  mkTask({ title: "Deploy a producción", status: "todo", priority: "urgent", projectId: "p1", assigneeId: "u2", due: "2026-09-02", tags: ["DevOps"], description: "Pipeline CI/CD y rollback automático." }),
  mkTask({ title: "Integrar CMS headless", status: "in_progress", priority: "medium", projectId: "p1", assigneeId: "u1", due: "2026-09-12", tags: ["Backend"] }),
  mkTask({ title: "Optimizar Core Web Vitals", status: "todo", priority: "low", projectId: "p1", assigneeId: "u4", due: "2026-09-25", tags: ["Performance"] }),
  mkTask({ title: "Página de contacto", status: "done", priority: "low", projectId: "p1", assigneeId: "u3", due: "2026-08-20" }),
  mkTask({ title: "Prototipo de navegación", status: "review", priority: "medium", projectId: "p2", assigneeId: "u3", due: "2026-09-10", tags: ["Diseño"] }),
  mkTask({ title: "Sincronización offline", status: "in_progress", priority: "high", projectId: "p2", assigneeId: "u1", due: "2026-09-18", tags: ["Backend"] }),
  mkTask({ title: "Notificaciones push", status: "todo", priority: "medium", projectId: "p2", assigneeId: "u5", due: "2026-09-28" }),
  mkTask({ title: "Modelo de datos", status: "done", priority: "high", projectId: "p3", assigneeId: "u4", due: "2026-08-01" }),
  mkTask({ title: "Gráficos de ingresos", status: "in_progress", priority: "medium", projectId: "p3", assigneeId: "u2", due: "2026-09-14" }),
  mkTask({ title: "Exportar reportes PDF", status: "todo", priority: "low", projectId: "p3", assigneeId: "u5", due: "2026-10-02" }),
  mkTask({ title: "Guía de marca", status: "in_progress", priority: "medium", projectId: "p4", assigneeId: "u3", due: "2026-09-22" }),
];

export const notifications: Notification[] = [
  { id: "n1", type: "assigned", actorId: "u2", text: "te asignó la tarea «Testing QA»", time: "2026-09-01T09:12:00", read: false, projectId: "p1" },
  { id: "n2", type: "comment", actorId: "u3", text: "comentó en «Revisión de UI»", time: "2026-09-01T08:40:00", read: false, projectId: "p1" },
  { id: "n3", type: "status", actorId: "u4", text: "movió «Diseñar wireframes» a Completado", time: "2026-08-31T17:05:00", read: false, projectId: "p1" },
  { id: "n4", type: "due", actorId: "u1", text: "«Deploy a producción» vence mañana", time: "2026-08-31T12:00:00", read: true, projectId: "p1" },
  { id: "n5", type: "member", actorId: "u1", text: "añadió a Sofía Gómez a «Dashboard Ventas»", time: "2026-08-30T15:30:00", read: true, projectId: "p3" },
  { id: "n6", type: "comment", actorId: "u5", text: "mencionó a tu equipo en «Gráficos de ingresos»", time: "2026-08-30T11:15:00", read: true, projectId: "p3" },
];

export function memberById(id: string | null): Member | undefined {
  return members.find((m) => m.id === id);
}

export function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function relTime(iso: string): string {
  const now = new Date("2026-09-01T10:00:00").getTime();
  const then = new Date(iso).getTime();
  const diff = Math.round((now - then) / 60000);
  if (diff < 1) return "ahora";
  if (diff < 60) return `hace ${diff} min`;
  const h = Math.round(diff / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < new Date("2026-09-01T00:00:00").getTime();
}
