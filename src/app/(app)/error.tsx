'use client';

import { ErrorState } from "@/src/components/ui";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6">
            <ErrorState onRetry={reset} />
        </div>
    );
}
