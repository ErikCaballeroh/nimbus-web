import { Suspense } from "react";
import { SettingsScreen } from "@/features/auth/components/SettingsScreen";

export default function SettingsPage() {
    return (
        <Suspense fallback={null}>
            <SettingsScreen />
        </Suspense>
    );
}
