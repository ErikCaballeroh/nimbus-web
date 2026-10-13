import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/dal";
import { getProjectForUser } from "@/features/projects/queries";
import { listProjectMembers } from "@/features/members/queries";
import type { Project } from "@/features/projects/types";
import type { ProjectMember } from "@/features/members/types";
import { MembersScreen } from "@/features/members/components/MembersScreen";

export default async function MembersPage({ params }: { params: Promise<{ projectId: string }> }) {
    const user = await getCurrentUser();
    if (!user) redirect("/api/auth/clear-session");

    const { projectId } = await params;

    let project: Project;
    let members: ProjectMember[];
    try {
        [project, members] = await Promise.all([
            getProjectForUser(user.id, projectId),
            listProjectMembers(user.id, projectId),
        ]);
    } catch (err) {
        if (err instanceof ApiError && err.code === "NOT_FOUND") notFound();
        throw err;
    }

    return <MembersScreen project={project} members={members} />;
}
