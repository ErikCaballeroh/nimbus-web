import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { SettingsScreen } from "@/features/auth/components/SettingsScreen";

function SettingsSkeleton() {
    return (
        <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6">
            <div className="mb-6 flex gap-4 border-b border-border pb-2.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-10 w-full" />
            <Skeleton className="mt-4 h-10 w-full" />
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SettingsScreen />
        </Suspense>
    );
}
