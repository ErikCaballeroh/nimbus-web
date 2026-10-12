'use client';

import { useParams } from "next/navigation";
import { BoardScreen } from "@/src/features/tasks/components/BoardScreen";
import { useStore } from "@/src/store";

export default function BoardPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { projects } = useStore();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;
    return <BoardScreen project={project} />;
}
