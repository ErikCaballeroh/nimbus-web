import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "../../lib/auth/dal";
import { listProjectsForUser } from "../../features/projects/queries";
import { AppShell } from "../../components/layout/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
    if (!user) redirect("/api/auth/clear-session");

    const projects = await listProjectsForUser(user.id);

    return <AppShell user={user} projects={projects}>{children}</AppShell>;
}
