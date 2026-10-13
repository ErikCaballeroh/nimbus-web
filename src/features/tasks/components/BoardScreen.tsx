'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "../../../components/ui";
import { apiFetch, ApiClientError } from "../../../lib/apiClient";
import { hasRole } from "../../../lib/roles";
import type { Project } from "../../projects/types";
import type { ProjectMember } from "../../members/types";
import type { Tag } from "../../tags/types";
import { ExportModal } from "../../import-export/components/ExportModal";
import { ImportModal } from "../../import-export/components/ImportModal";
import { statusOrder, type Status, type Task } from "../types";
import { BoardColumn } from "./BoardColumn";
import { BoardToolbar } from "./BoardToolbar";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskFormModal } from "./TaskFormModal";

export function BoardScreen({
  project,
  members,
  tasks: initialTasks,
  tags,
}: {
  project: Project;
  members: ProjectMember[];
  tasks: Task[];
  tags: Tag[];
}) {
  const router = useRouter();
  const canEdit = hasRole(project.myRole, "editor");

  // Reset the optimistic copy whenever the server gives us fresh tasks
  // (e.g. after router.refresh()), without a setState-in-effect cascade.
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  const [tasks, setTasks] = useState(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [createStatus, setCreateStatus] = useState<Status | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [error, setError] = useState("");

  const detail = tasks.find((t) => t.id === detailId) ?? null;

  const onDrop = async (status: Status) => {
    const taskId = drag;
    setDrag(null);
    setOver(null);
    if (!taskId || !canEdit) return;

    const previous = tasks;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await apiFetch(`/api/tasks/${taskId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      router.refresh();
    } catch (err) {
      setTasks(previous);
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <BoardToolbar
        project={project}
        taskCount={tasks.length}
        memberCount={members.length}
        canCreateTask={canEdit}
        onImport={() => setImportOpen(true)}
        onExport={() => setExportOpen(true)}
        onCreateTask={() => setCreateStatus("todo")}
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-max gap-4 p-5 sm:px-6">
          {statusOrder.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              canEdit={canEdit}
              draggingTaskId={drag}
              isDropTarget={over === status}
              onDragOver={() => setOver(status)}
              onDragLeave={() => setOver((o) => (o === status ? null : o))}
              onDrop={() => onDrop(status)}
              onCreateTask={() => setCreateStatus(status)}
              onDragStartTask={setDrag}
              onDragEndTask={() => setDrag(null)}
              onOpenTask={(t) => setDetailId(t.id)}
            />
          ))}
        </div>
      </div>

      {createStatus && (
        <TaskFormModal
          open
          onClose={() => setCreateStatus(null)}
          project={project}
          members={members}
          initialStatus={createStatus}
          onSaved={() => router.refresh()}
        />
      )}
      <TaskDetailModal
        task={detail}
        tags={tags}
        canEdit={canEdit}
        canDelete={hasRole(project.myRole, "admin")}
        onClose={() => setDetailId(null)}
        onChanged={() => router.refresh()}
      />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} count={tasks.length} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      {error && <Toast message={error} onDismiss={() => setError("")} />}
    </div>
  );
}
