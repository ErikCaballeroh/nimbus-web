import type { ReactNode } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-40 -translate-x-1/2 scale-90 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-all duration-150 group-hover/tt:scale-100 group-hover/tt:opacity-100">
        {label}
      </span>
    </span>
  );
}
