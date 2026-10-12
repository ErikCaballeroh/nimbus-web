import { statusMeta, type Status } from "../../../lib/data";

export function StatusPill({ status }: { status: Status }) {
  const m = statusMeta[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: m.accent }} />
      {m.label}
    </span>
  );
}
