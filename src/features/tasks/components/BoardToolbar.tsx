import { Button, Icon } from "@/components/ui";
import type { Project } from "@/features/projects/types";

export function BoardToolbar({
  project,
  taskCount,
  memberCount,
  canCreateTask,
  onImport,
  onExport,
  onCreateTask,
}: {
  project: Project;
  taskCount: number;
  memberCount: number;
  canCreateTask: boolean;
  onImport: () => void;
  onExport: () => void;
  onCreateTask: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-5 py-3 sm:px-6">
      <div className="mr-auto flex items-center gap-2 text-[13px] text-muted-foreground">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: project.color }} />
        {taskCount} tareas · {memberCount} miembros
      </div>
      <Button variant="secondary" size="sm" onClick={onImport}><Icon.upload width={15} height={15} /> Importar</Button>
      <Button variant="secondary" size="sm" onClick={onExport}><Icon.download width={15} height={15} /> Exportar</Button>
      {canCreateTask && (
        <Button size="sm" onClick={onCreateTask}><Icon.plus width={16} height={16} /> Nueva tarea</Button>
      )}
    </div>
  );
}
