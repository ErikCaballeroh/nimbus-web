import { Card } from "../../../components/ui";
import { fmtDateShort, isOverdue } from "../../../lib/utils";
import { PriorityBadge } from "../../tasks/components/PriorityBadge";
import { statusAccent, type Task } from "../../tasks/types";

export function UpcomingTasksCard({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Tareas próximas</h3>
      <div className="flex flex-col gap-1">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusAccent[t.status] }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-foreground">{t.title}</div>
              <div className={`text-xs ${isOverdue(t.due) ? "text-danger" : "text-muted-foreground"}`}>
                {isOverdue(t.due) ? "Atrasada · " : ""}{fmtDateShort(t.due)}
              </div>
            </div>
            <PriorityBadge priority={t.priority} dot />
          </div>
        ))}
      </div>
    </Card>
  );
}
