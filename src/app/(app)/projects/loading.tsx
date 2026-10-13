import { Card, Skeleton } from "@/components/ui";

export default function ProjectsLoading() {
    return (
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
            <Skeleton className="mb-5 h-9.5 w-64" />
            <Card className="p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="ml-auto h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </Card>
        </div>
    );
}
