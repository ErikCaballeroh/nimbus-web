import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getDashboardSummary } from "@/features/dashboard/queries";
import { listNotificationsForUser } from "@/features/notifications/queries";
import { DashboardScreen } from "@/features/dashboard/components/DashboardScreen";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/api/auth/clear-session");

    const [summary, notifications] = await Promise.all([
        getDashboardSummary(user.id),
        listNotificationsForUser(user.id),
    ]);

    return <DashboardScreen summary={summary} recentActivity={notifications.slice(0, 5)} />;
}
