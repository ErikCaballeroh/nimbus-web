import { Card, Skeleton } from "@/components/ui";

export default function NotificationsLoading() {
    return (
        <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6">
            <Card className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3.5 px-4 py-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-3.5 w-3/4" />
                            <Skeleton className="mt-2 h-3 w-16" />
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
}
