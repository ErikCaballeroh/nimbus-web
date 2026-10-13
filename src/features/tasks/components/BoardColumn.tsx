import { Icon, IconButton, Tooltip } from "../../../components/ui";
import { es } from "../../../lib/i18n/es";
import { statusAccent, type Status, type Task } from "../types";
import { TaskCard } from "./TaskCard";

export function BoardColumn({
  status,
  tasks,
  canEdit,
  draggingTaskId,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  onCreateTask,
  onDragStartTask,
  onDragEndTask,
  onOpenTask,
}: {
  status: Status;
  tasks: Task[];
  canEdit: boolean;
  draggingTaskId: string | null;
  isDropTarget: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onCreateTask: () => void;
  onDragStartTask: (id: string) => void;
  onDragEndTask: () => void;
  onOpenTask: (task: Task) => void;
}) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex h-full w-80 flex-col rounded-xl border transition-colors ${isDropTarget ? "border-primary bg-accent/40" : "border-border bg-secondary/30"
        }`}
    >
      <div className="flex items-center gap-2 px-3.5 py-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusAccent[status] }} />
        <span className="text-[13px] font-semibold text-foreground">{es.enums.status[status]}</span>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{tasks.length}</span>
        {canEdit && (
          <Tooltip label="Añadir tarea">
            <IconButton className="ml-auto h-7 w-7" onClick={onCreateTask}>
              <Icon.plus width={16} height={16} />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-3">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            draggable={canEdit}
            dragging={draggingTaskId === t.id}
            onDragStart={() => onDragStartTask(t.id)}
            onDragEnd={onDragEndTask}
            onClick={() => onOpenTask(t)}
          />
        ))}

        {tasks.length === 0 && canEdit && (
          <button
            onClick={onCreateTask}
            className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border-strong py-8 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon.plus width={18} height={18} />
            Añadir tarea
          </button>
        )}
      </div>
    </div>
  );
}
