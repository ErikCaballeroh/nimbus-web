import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "../../lib/auth/dal";
import { AppShell } from "../../components/layout/AppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return <AppShell user={user}>{children}</AppShell>;
}
