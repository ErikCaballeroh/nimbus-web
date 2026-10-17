import { Card, EmptyState, Icon } from "@/components/ui";
import { fmtDateShort } from "@/lib/utils";
import { PriorityBadge } from "@/features/tasks/components/PriorityBadge";
import { statusAccent } from "@/features/tasks/types";
import type { UpcomingTask } from "@/features/dashboard/types";

export function UpcomingTasksCard({ tasks }: { tasks: UpcomingTask[] }) {
  return (
    <Card className="p-5 lg:col-span-3">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Tareas próximas</h3>
      {tasks.length === 0 ? (
        <EmptyState icon={<Icon.check_circle width={22} height={22} />} title="Sin tareas pendientes" body="No hay tareas con fecha límite próxima." />
      ) : (
        <div className="flex flex-col gap-1">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: statusAccent[t.status] }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-foreground">{t.title}</div>
                <div className={`text-xs ${t.overdue ? "text-danger" : "text-muted-foreground"}`}>
                  {t.overdue ? "Atrasada · " : ""}{fmtDateShort(t.dueDate)}
                </div>
              </div>
              <PriorityBadge priority={t.priority} dot />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
