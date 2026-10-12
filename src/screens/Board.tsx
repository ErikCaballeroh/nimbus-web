'use client';

import { useState } from "react";
import { Icon } from "../components/icons";
import { Avatar, Button, IconButton, PriorityBadge, Skeleton, Tag, Tooltip } from "../components/ui";
import { ExportModal, ImportModal, TaskDetailModal, TaskModal } from "../components/Modals";
import { useStore } from "../store";
import { fmtDateShort, isOverdue, statusMeta, statusOrder, type Status, type Task } from "../lib/data";

export function Board({ projectId, loading }: { projectId: string; loading: boolean }) {
  const { tasks, members, projects, moveTask } = useStore();
  const project = projects.find((p) => p.id === projectId);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [createStatus, setCreateStatus] = useState<Status | null>(null);
  const [detail, setDetail] = useState<Task | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  if (!project) return null;
  const projTasks = tasks.filter((t) => t.projectId === projectId);

  const onDrop = (status: Status) => {
    if (drag) moveTask(drag, status);
    setDrag(null);
    setOver(null);
  };

  if (loading) return <BoardSkeleton />;

  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-3 sm:px-6">
        <div className="mr-auto flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: project.color }} />
          {projTasks.length} tareas · {members.filter((m) => project.memberIds.includes(m.id)).length} miembros
        </div>
        <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}><Icon.upload width={15} height={15} /> Importar</Button>
        <Button variant="secondary" size="sm" onClick={() => setExportOpen(true)}><Icon.download width={15} height={15} /> Exportar</Button>
        <Button size="sm" onClick={() => setCreateStatus("todo")}><Icon.plus width={16} height={16} /> Nueva tarea</Button>
      </div>

      {/* columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-max gap-4 p-5 sm:px-6">
          {statusOrder.map((status) => {
            const colTasks = projTasks.filter((t) => t.status === status);
            const meta = statusMeta[status];
            return (
              <div
                key={status}
                onDragOver={(e) => { e.preventDefault(); setOver(status); }}
                onDragLeave={() => setOver((o) => (o === status ? null : o))}
                onDrop={() => onDrop(status)}
                className={`flex h-full w-80 flex-col rounded-xl border transition-colors ${over === status ? "border-primary bg-accent/40" : "border-border bg-secondary/30"
                  }`}
              >
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.accent }} />
                  <span className="text-[13px] font-semibold text-foreground">{meta.label}</span>
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{colTasks.length}</span>
                  <Tooltip label="Añadir tarea">
                    <IconButton className="ml-auto h-7 w-7" onClick={() => setCreateStatus(status)}>
                      <Icon.plus width={16} height={16} />
                    </IconButton>
                  </Tooltip>
                </div>

                <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-3">
                  {colTasks.map((t) => {
                    const assignee = members.find((m) => m.id === t.assigneeId);
                    return (
                      <article
                        key={t.id}
                        draggable
                        onDragStart={() => setDrag(t.id)}
                        onDragEnd={() => setDrag(null)}
                        onClick={() => setDetail(t)}
                        className={`group cursor-pointer rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-sm)] transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)] active:cursor-grabbing ${drag === t.id ? "opacity-40 rotate-1" : ""
                          }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <PriorityBadge priority={t.priority} />
                          <span className="text-[11px] font-medium text-muted-foreground">{t.code}</span>
                        </div>
                        <h4 className="text-[13px] font-medium leading-snug text-foreground">{t.title}</h4>
                        {t.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {t.tags.map((tg) => <Tag key={tg}>{tg}</Tag>)}
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-xs ${isOverdue(t.due) && t.status !== "done" ? "text-danger" : "text-muted-foreground"}`}>
                            <Icon.calendar width={13} height={13} /> {fmtDateShort(t.due)}
                          </span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {t.comments.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs"><Icon.message width={13} height={13} /> {t.comments.length}</span>
                            )}
                            {assignee ? <Avatar member={assignee} size={24} /> : <span className="h-6 w-6 rounded-full border border-dashed border-border-strong" />}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <button
                      onClick={() => setCreateStatus(status)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border-strong py-8 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon.plus width={18} height={18} />
                      Añadir tarea
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {createStatus && <TaskModal open onClose={() => setCreateStatus(null)} projectId={projectId} initialStatus={createStatus} />}
      <TaskDetailModal task={detail} onClose={() => setDetail(null)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} count={projTasks.length} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} projectId={projectId} />
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden p-5 sm:px-6">
      {statusOrder.map((s) => (
        <div key={s} className="w-80 rounded-xl border border-border bg-secondary/30 p-2.5">
          <Skeleton className="mb-3 h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-2.5 rounded-lg border border-border bg-card p-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-3 h-6 w-6 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
