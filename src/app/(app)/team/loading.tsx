import { Card, Skeleton } from "@/components/ui";

export default function TeamLoading() {
    return (
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="p-5">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="mt-2 h-3 w-40" />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-6 border-t border-border pt-4">
                            <Skeleton className="h-8 w-10" />
                            <Skeleton className="h-8 w-10" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
