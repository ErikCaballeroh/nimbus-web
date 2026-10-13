import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/dal";
import { listProjectsForUser } from "../../../features/projects/queries";
import { ProjectsScreen } from "../../../features/projects/components/ProjectsScreen";

export default async function ProjectsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const projects = await listProjectsForUser(user.id);
    return <ProjectsScreen projects={projects} />;
}
