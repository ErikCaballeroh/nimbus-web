'use client';

import { Dashboard } from "@/src/screens/Dashboard";
import { useDashboardContext } from "@/src/components/DashboardLayout";

export default function DashboardPage() {
    const { loading, go } = useDashboardContext();
    return <Dashboard loading={loading} go={go} />;
}