'use client';

import { useEffect, useState, type ReactNode } from "react";
import { Avatar, Button, Icon, Input, Modal, Select, Tag } from "../../../components/ui";
import { es } from "../../../lib/i18n/es";
import { fmtDate, relTime } from "../../../lib/utils";
import { apiFetch, ApiClientError } from "../../../lib/apiClient";
import { useCurrentUser } from "../../auth/CurrentUserContext";
import type { Comment } from "../../comments/types";
import type { Tag as TagType } from "../../tags/types";
import { statusOrder, type Priority, type Status, type Task } from "../types";

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

export function TaskDetailModal({
  task,
  tags,
  canEdit,
  canDelete,
  onClose,
  onChanged,
}: {
  task: Task | null;
  tags: TagType[];
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const me = useCurrentUser();
  // Clear the previous task's comments as soon as a new one opens, without a
  // setState-in-effect cascade; the effect below only kicks off the fetch.
  const [commentsTaskId, setCommentsTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  if (task && task.id !== commentsTaskId) {
    setCommentsTaskId(task.id);
    setComments([]);
  }

  useEffect(() => {
    if (!task) return;
    apiFetch<Comment[]>(`/api/tasks/${task.id}/comments`)
      .then(setComments)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado."));
  }, [task]);

  if (!task) return null;

  const run = async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
    }
  };

  const changeStatus = (status: Status) => run(async () => {
    await apiFetch(`/api/tasks/${task.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    onChanged();
  });

  const changePriority = (priority: Priority) => run(async () => {
    await apiFetch(`/api/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ priority }) });
    onChanged();
  });

  const toggleTag = (tagId: string) => run(async () => {
    const tagIds = task.tags.some((t) => t.id === tagId)
      ? task.tags.filter((t) => t.id !== tagId).map((t) => t.id)
      : [...task.tags.map((t) => t.id), tagId];
    await apiFetch(`/api/tasks/${task.id}/tags`, { method: "PUT", body: JSON.stringify({ tagIds }) });
    onChanged();
  });

  const createTag = () => run(async () => {
    const name = newTag.trim();
    if (!name) return;
    const created = await apiFetch<TagType>("/api/tags", { method: "POST", body: JSON.stringify({ name }) });
    setNewTag("");
    await apiFetch(`/api/tasks/${task.id}/tags`, {
      method: "PUT",
      body: JSON.stringify({ tagIds: [...task.tags.map((t) => t.id), created.id] }),
    });
    onChanged();
  });

  const addComment = () => run(async () => {
    const text = newComment.trim();
    if (!text) return;
    const comment = await apiFetch<Comment>(`/api/tasks/${task.id}/comments`, { method: "POST", body: JSON.stringify({ text }) });
    setComments((cur) => [...cur, comment]);
    setNewComment("");
    onChanged();
  });

  const deleteComment = (commentId: string) => run(async () => {
    await apiFetch(`/api/comments/${commentId}`, { method: "DELETE" });
    setComments((cur) => cur.filter((c) => c.id !== commentId));
    onChanged();
  });

  const deleteTask = () => run(async () => {
    await apiFetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onChanged();
    onClose();
  });

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

          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-muted-foreground">Etiquetas</h4>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const active = task.tags.some((tg) => tg.id === t.id);
                return (
                  <button key={t.id} disabled={!canEdit} onClick={() => toggleTag(t.id)} className={active ? "" : "opacity-40"}>
                    <Tag>{t.name}</Tag>
                  </button>
                );
              })}
            </div>
            {canEdit && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim()) createTag(); }}
                  placeholder="Nueva etiqueta…"
                />
                <Button variant="secondary" onClick={createTag} disabled={!newTag.trim()}>Añadir</Button>
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
              <Icon.message width={15} height={15} /> Comentarios ({comments.length})
            </h4>
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.authorName} color={c.authorAvatarColor} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-foreground">{c.authorName}</span>
                      <span className="text-xs text-muted-foreground">{relTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">{c.text}</p>
                  </div>
                  {(c.authorId === me.id || canDelete) && (
                    <button onClick={() => deleteComment(c.id)} className="self-start text-muted-foreground hover:text-danger">
                      <Icon.trash width={14} height={14} />
                    </button>
                  )}
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>}
            </div>

            {canEdit && (
              <div className="mt-4 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newComment.trim()) addComment(); }}
                  placeholder="Escribe un comentario…"
                />
                <Button onClick={addComment} disabled={!newComment.trim()}>Enviar</Button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        {/* meta sidebar */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/40 p-4">
          <MetaRow label="Estado">
            <Select value={task.status} disabled={!canEdit} onChange={(e) => changeStatus(e.target.value as Status)}>
              {statusOrder.map((s) => <option key={s} value={s}>{es.enums.status[s]}</option>)}
            </Select>
          </MetaRow>
          <MetaRow label="Prioridad">
            <Select value={task.priority} disabled={!canEdit} onChange={(e) => changePriority(e.target.value as Priority)}>
              {(Object.keys(es.enums.priority) as Priority[]).map((p) => <option key={p} value={p}>{es.enums.priority[p]}</option>)}
            </Select>
          </MetaRow>
          <MetaRow label="Asignado a">
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size={26} />
                <span className="text-[13px] text-foreground">{task.assignee.name}</span>
              </div>
            ) : (
              <span className="text-[13px] text-muted-foreground">Sin asignar</span>
            )}
          </MetaRow>
          <MetaRow label="Fecha límite">
            <div className="flex items-center gap-1.5 text-[13px] text-foreground">
              <Icon.calendar width={15} height={15} className="text-muted-foreground" /> {task.dueDate ? fmtDate(task.dueDate) : "Sin fecha"}
            </div>
          </MetaRow>
          {canDelete && (
            <Button variant="secondary" size="sm" onClick={deleteTask} className="mt-2 text-danger">
              <Icon.trash width={15} height={15} /> Eliminar tarea
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
