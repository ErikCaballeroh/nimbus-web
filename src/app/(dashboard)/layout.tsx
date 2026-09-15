import type { ReactNode } from "react";
import { DashboardLayout } from "@/src/components/DashboardLayout";

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}