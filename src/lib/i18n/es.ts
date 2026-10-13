/**
 * Centralized Spanish UI dictionary. Screens are wired to this incrementally
 * (see docs/ROADMAP.md) — for now it covers the components/ui primitives
 * plus the enum label maps used across features/*.
 */
export const es = {
  common: {
    modal: {
      close: "Cerrar",
    },
    errorState: {
      title: "No pudimos cargar los datos",
      body: "Ocurrió un error de conexión. Revisa tu red e inténtalo de nuevo.",
      retry: "Reintentar",
    },
    toast: {
      dismiss: "Cerrar",
    },
  },
  enums: {
    priority: {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
    },
    status: {
      todo: "Pendiente",
      in_progress: "En progreso",
      review: "Revisión",
      done: "Completado",
    },
    role: {
      owner: "Propietario",
      admin: "Administrador",
      editor: "Editor",
      viewer: "Lector",
    },
    notificationType: {
      assigned: "Asignaciones",
      comment: "Comentarios",
      status: "Estados",
      member: "Miembros",
      due: "Vencimientos",
    },
  },
  notifications: {
    assigned: (taskTitle: string) => `te asignó la tarea «${taskTitle}»`,
    comment: (taskTitle: string) => `comentó en «${taskTitle}»`,
    status: (taskTitle: string, statusLabel: string) => `movió «${taskTitle}» a ${statusLabel}`,
    member: (projectName: string) => `te añadió a «${projectName}»`,
    due: (taskTitle: string) => `«${taskTitle}» vence mañana`,
  },
} as const;
