import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "../../lib/auth/dal";
import { listProjectsForUser } from "../../features/projects/queries";
import { listNotificationsForUser } from "../../features/notifications/queries";
import { AppShell } from "../../components/layout/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
    if (!user) redirect("/api/auth/clear-session");

    const [projects, notifications] = await Promise.all([
        listProjectsForUser(user.id),
        listNotificationsForUser(user.id),
    ]);

    return <AppShell user={user} projects={projects} notifications={notifications}>{children}</AppShell>;
}
