'use client';

import { useParams } from "next/navigation";
import { Members } from "@/src/screens/Members";

export default function MembersPage() {
    const params = useParams<{ id: string }>();
    return <Members projectId={params.id} />;
}