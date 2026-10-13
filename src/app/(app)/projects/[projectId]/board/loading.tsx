import { Skeleton } from "@/components/ui";
import { statusOrder } from "@/features/tasks/types";

export default function BoardLoading() {
    return (
        <div className="flex gap-4 overflow-hidden p-5 sm:px-6">
            {statusOrder.map((s) => (
                <div key={s} className="w-80 rounded-xl border border-border bg-secondary/30 p-2.5">
                    <Skeleton className="mb-3 h-5 w-32" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="mb-2.5 rounded-lg border border-border bg-card p-3">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="mt-2 h-4 w-full" />
                            <Skeleton className="mt-3 h-6 w-6 rounded-full" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
