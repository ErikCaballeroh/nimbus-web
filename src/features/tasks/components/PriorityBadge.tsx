import { es } from "../../../lib/i18n/es";
import { priorityTone, type Priority } from "../types";

export function PriorityBadge({ priority, dot }: { priority: Priority; dot?: boolean }) {
  const tone = priorityTone[priority];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium"
      style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {!dot && es.enums.priority[priority]}
    </span>
  );
}
