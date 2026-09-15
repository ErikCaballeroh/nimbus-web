'use client';

import { useParams } from "next/navigation";
import { Board } from "@/src/screens/Board";
import { useDashboardContext } from "@/src/components/DashboardLayout";

export default function BoardPage() {
    const params = useParams<{ id: string }>();
    const { loading } = useDashboardContext();
    return <Board projectId={params.id} loading={loading} />;
}