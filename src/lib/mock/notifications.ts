import type { Notification } from "../../features/notifications/types";

export const notifications: Notification[] = [
  { id: "n1", type: "assigned", actorId: "u2", text: "te asignó la tarea «Testing QA»", time: "2026-09-01T09:12:00", read: false, projectId: "p1" },
  { id: "n2", type: "comment", actorId: "u3", text: "comentó en «Revisión de UI»", time: "2026-09-01T08:40:00", read: false, projectId: "p1" },
  { id: "n3", type: "status", actorId: "u4", text: "movió «Diseñar wireframes» a Completado", time: "2026-08-31T17:05:00", read: false, projectId: "p1" },
  { id: "n4", type: "due", actorId: "u1", text: "«Deploy a producción» vence mañana", time: "2026-08-31T12:00:00", read: true, projectId: "p1" },
  { id: "n5", type: "member", actorId: "u1", text: "añadió a Sofía Gómez a «Dashboard Ventas»", time: "2026-08-30T15:30:00", read: true, projectId: "p3" },
  { id: "n6", type: "comment", actorId: "u5", text: "mencionó a tu equipo en «Gráficos de ingresos»", time: "2026-08-30T11:15:00", read: true, projectId: "p3" },
];
