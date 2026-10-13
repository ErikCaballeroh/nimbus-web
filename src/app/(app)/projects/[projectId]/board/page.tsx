import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProjectForUser } from "@/features/projects/queries";
import { listProjectMembers } from "@/features/members/queries";
import { listTasksForProject } from "@/features/tasks/queries";
import { listTags } from "@/features/tags/queries";
import type { Project } from "@/features/projects/types";
import type { ProjectMember } from "@/features/members/types";
import type { Task } from "@/features/tasks/types";
import type { Tag } from "@/features/tags/types";
import { BoardScreen } from "@/features/tasks/components/BoardScreen";

export default async function BoardPage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await getCurrentUser();
    if (!user) redirect("/api/auth/clear-session");

    const { projectId } = await params;

    let project: Project;
    let members: ProjectMember[];
    let tasks: Task[];
    let tags: Tag[];
    try {
        [project, members, tasks, tags] = await Promise.all([
            getProjectForUser(user.id, projectId),
            listProjectMembers(user.id, projectId),
            listTasksForProject(user.id, projectId, {}),
            listTags(),
        ]);
    } catch (err) {
        if (err instanceof ApiError && err.code === "NOT_FOUND") notFound();
        throw err;
    }

    return <BoardScreen project={project} members={members} tasks={tasks} tags={tags} />;
}
