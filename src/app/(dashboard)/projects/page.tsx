'use client';

import { Projects } from "@/src/screens/Projects";
import { useDashboardContext } from "@/src/components/DashboardLayout";

export default function ProjectsPage() {
    const { loading, go } = useDashboardContext();
    return <Projects loading={loading} go={go} />;
}