/**
 * Centralized Spanish UI dictionary. Screens are wired to this incrementally
 * (see docs/ROADMAP.md) — for now it covers the components/ui primitives
 * plus the enum label maps also used by the mock data in lib/data.ts.
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
      in_progress: "En Progreso",
      review: "Revisión",
      done: "Completado",
    },
    role: {
      Propietario: "Propietario",
      Administrador: "Administrador",
      Editor: "Editor",
      Lector: "Lector",
    },
    notificationType: {
      assigned: "Asignaciones",
      comment: "Comentarios",
      status: "Estados",
      member: "Miembros",
      due: "Vencimientos",
    },
  },
} as const;
