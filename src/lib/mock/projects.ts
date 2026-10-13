import type { MockProject } from "./types";

export const projects: MockProject[] = [
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
