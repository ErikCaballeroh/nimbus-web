'use client';

import { useRouter } from "next/navigation";
import { Auth, type AuthView } from "../screens/Auth";

export function AuthRoute({ initialView }: { initialView: AuthView }) {
    const router = useRouter();
    return <Auth initialView={initialView} onAuthed={() => router.replace("/dashboard")} />;
}