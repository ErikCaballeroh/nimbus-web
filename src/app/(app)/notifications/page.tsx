import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { listNotificationsForUser } from "@/features/notifications/queries";
import { NotificationsScreen } from "@/features/notifications/components/NotificationsScreen";

export default async function NotificationsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/api/auth/clear-session");

    const notifications = await listNotificationsForUser(user.id);
    return <NotificationsScreen notifications={notifications} />;
}
