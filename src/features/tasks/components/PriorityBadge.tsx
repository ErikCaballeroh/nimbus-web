import { priorityMeta, type Priority } from "../../../lib/data";

export function PriorityBadge({ priority, dot }: { priority: Priority; dot?: boolean }) {
  const m = priorityMeta[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium"
      style={{ color: m.token, background: `color-mix(in srgb, ${m.token} 12%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.token }} />
      {!dot && m.label}
    </span>
  );
}
