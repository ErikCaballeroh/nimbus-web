import { Avatar, Icon, Tag } from "../../../components/ui";
import { fmtDateShort, isOverdue } from "../../../lib/utils";
import type { MockMember } from "../../../lib/mock/types";
import type { Task } from "../types";
import { PriorityBadge } from "./PriorityBadge";

export function TaskCard({
  task,
  assignee,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  task: Task;
  assignee: MockMember | undefined;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)] active:cursor-grabbing ${dragging ? "opacity-40 rotate-1" : ""
        }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <span className="text-[11px] font-medium text-muted-foreground">{task.code}</span>
      </div>
      <h4 className="text-[13px] font-medium leading-snug text-foreground">{task.title}</h4>
      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 text-xs ${isOverdue(task.due) && task.status !== "done" ? "text-danger" : "text-muted-foreground"}`}>
          <Icon.calendar width={13} height={13} /> {fmtDateShort(task.due)}
        </span>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.comments.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs"><Icon.message width={13} height={13} /> {task.comments.length}</span>
          )}
          {assignee ? <Avatar name={assignee.name} color={assignee.color} size={24} /> : <span className="h-6 w-6 rounded-full border border-dashed border-border-strong" />}
        </div>
      </div>
    </article>
  );
}
