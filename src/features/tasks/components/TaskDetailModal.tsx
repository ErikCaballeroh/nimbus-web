'use client';

import { useState, type ReactNode } from "react";
import { Avatar, Button, Icon, Input, Modal, Select, Tag } from "../../../components/ui";
import { es } from "../../../lib/i18n/es";
import { fmtDate, relTime } from "../../../lib/utils";
import { useStore } from "../../../store";
import { statusOrder, type Priority, type Status, type Task } from "../types";

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

export function TaskDetailModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { members, updateTask, addComment, moveTask } = useStore();
  const [comment, setComment] = useState("");
  if (!task) return null;
  const assignee = members.find((m) => m.id === task.assigneeId);

  return (
    <Modal open={!!task} onClose={onClose} title={task.title} subtitle={task.code} size="lg">
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-5">
          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-muted-foreground">Descripción</h4>
            <p className="text-sm leading-relaxed text-foreground">
              {task.description || "Sin descripción. Añade contexto para tu equipo."}
            </p>
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          )}

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
              <Icon.message width={15} height={15} /> Comentarios ({task.comments.length})
            </h4>
            <div className="flex flex-col gap-4">
              {task.comments.map((c) => {
                const a = members.find((m) => m.id === c.authorId)!;
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={a.name} color={a.color} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-medium text-foreground">{a.name}</span>
                        <span className="text-xs text-muted-foreground">{relTime(c.time)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-foreground">{c.text}</p>
                    </div>
                  </div>
                );
              })}
              {task.comments.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comment.trim()) { addComment(task.id, comment.trim()); setComment(""); }
                }}
                placeholder="Escribe un comentario…"
              />
              <Button
                onClick={() => { if (comment.trim()) { addComment(task.id, comment.trim()); setComment(""); } }}
                disabled={!comment.trim()}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>

        {/* meta sidebar */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/40 p-4">
          <MetaRow label="Estado">
            <Select value={task.status} onChange={(e) => moveTask(task.id, e.target.value as Status)}>
              {statusOrder.map((s) => <option key={s} value={s}>{es.enums.status[s]}</option>)}
            </Select>
          </MetaRow>
          <MetaRow label="Prioridad">
            <Select value={task.priority} onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}>
              {(Object.keys(es.enums.priority) as Priority[]).map((p) => <option key={p} value={p}>{es.enums.priority[p]}</option>)}
            </Select>
          </MetaRow>
          <MetaRow label="Asignado a">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={assignee.name} color={assignee.color} size={26} />
                <span className="text-[13px] text-foreground">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-[13px] text-muted-foreground">Sin asignar</span>
            )}
          </MetaRow>
          <MetaRow label="Fecha límite">
            <div className="flex items-center gap-1.5 text-[13px] text-foreground">
              <Icon.calendar width={15} height={15} className="text-muted-foreground" /> {fmtDate(task.due)}
            </div>
          </MetaRow>
        </div>
      </div>
    </Modal>
  );
}
