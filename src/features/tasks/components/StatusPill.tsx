import { es } from "@/lib/i18n/es";
import { statusAccent, type Status } from "@/features/tasks/types";

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: statusAccent[status] }} />
      {es.enums.status[status]}
    </span>
  );
}
