'use client';

import { useState } from "react";
import { useStore } from "../../../store";
import { ExportModal } from "../../import-export/components/ExportModal";
import { ImportModal } from "../../import-export/components/ImportModal";
import type { Project } from "../../projects/types";
import { statusOrder, type Status, type Task } from "../types";
import { BoardColumn } from "./BoardColumn";
import { BoardToolbar } from "./BoardToolbar";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskFormModal } from "./TaskFormModal";

export function BoardScreen({ project }: { project: Project }) {
  const { tasks, members, moveTask } = useStore();
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [createStatus, setCreateStatus] = useState<Status | null>(null);
  const [detail, setDetail] = useState<Task | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const projTasks = tasks.filter((t) => t.projectId === project.id);
  const projMembers = members.filter((m) => project.memberIds.includes(m.id));

  const onDrop = (status: Status) => {
    if (drag) moveTask(drag, status);
    setDrag(null);
    setOver(null);
  };

  return (
    <div className="flex h-full flex-col">
      <BoardToolbar
        project={project}
        taskCount={projTasks.length}
        memberCount={projMembers.length}
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
              tasks={projTasks.filter((t) => t.status === status)}
              members={members}
              draggingTaskId={drag}
              isDropTarget={over === status}
              onDragOver={() => setOver(status)}
              onDragLeave={() => setOver((o) => (o === status ? null : o))}
              onDrop={() => onDrop(status)}
              onCreateTask={() => setCreateStatus(status)}
              onDragStartTask={setDrag}
              onDragEndTask={() => setDrag(null)}
              onOpenTask={setDetail}
            />
          ))}
        </div>
      </div>

      {createStatus && <TaskFormModal open onClose={() => setCreateStatus(null)} project={project} initialStatus={createStatus} />}
      <TaskDetailModal task={detail} onClose={() => setDetail(null)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} count={projTasks.length} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} projectId={project.id} />
    </div>
  );
}
