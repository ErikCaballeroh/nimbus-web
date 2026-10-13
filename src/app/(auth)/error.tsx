'use client';

import { ErrorState } from "@/components/ui";

export default function AuthError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="flex min-h-full items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <ErrorState onRetry={reset} />
            </div>
        </div>
    );
}
