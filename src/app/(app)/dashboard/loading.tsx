import { Card, Skeleton } from "@/components/ui";

export default function DashboardLoading() {
    return (
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-5">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="mt-4 h-8 w-20" />
                        <Skeleton className="mt-2 h-4 w-28" />
                    </Card>
                ))}
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2"><Skeleton className="h-4 w-40" /><Skeleton className="mt-6 h-56 w-full" /></Card>
                <Card className="p-5"><Skeleton className="h-4 w-40" />{Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="mt-4 flex gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1"><Skeleton className="h-3 w-full" /><Skeleton className="mt-2 h-3 w-16" /></div></div>
                ))}</Card>
            </div>
        </div>
    );
}
