import type { Priority, Status, Task } from "../../features/tasks/types";

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
