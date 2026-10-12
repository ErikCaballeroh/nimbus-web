'use client';

import { useParams } from "next/navigation";
import { MembersScreen } from "@/src/features/members/components/MembersScreen";
import { useStore } from "@/src/store";

export default function MembersPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { projects } = useStore();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;
    return <MembersScreen project={project} />;
}
