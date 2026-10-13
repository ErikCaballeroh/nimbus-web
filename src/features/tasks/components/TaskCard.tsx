import { Avatar, Icon, Tag } from "../../../components/ui";
import { fmtDateShort, isOverdue } from "../../../lib/utils";
import type { Task } from "../types";
import { PriorityBadge } from "./PriorityBadge";

export function TaskCard({
  task,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  task: Task;
  draggable: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  return (
    <article
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      onClick={onClick}
      className={`group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)] ${draggable ? "active:cursor-grabbing" : ""} ${dragging ? "opacity-40 rotate-1" : ""
        }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <span className="text-[11px] font-medium text-muted-foreground">{task.code}</span>
      </div>
      <h4 className="text-[13px] font-medium leading-snug text-foreground">{task.title}</h4>
      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tg) => <Tag key={tg.id}>{tg.name}</Tag>)}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-xs ${task.dueDate && isOverdue(task.dueDate) && task.status !== "done" ? "text-danger" : "text-muted-foreground"}`}>
          <Icon.calendar width={13} height={13} /> {task.dueDate ? fmtDateShort(task.dueDate) : "Sin fecha"}
        </span>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs"><Icon.message width={13} height={13} /> {task.commentCount}</span>
          )}
          {task.assignee ? <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size={24} /> : <span className="h-6 w-6 rounded-full border border-dashed border-border-strong" />}
        </div>
      </div>
    </article>
  );
}
