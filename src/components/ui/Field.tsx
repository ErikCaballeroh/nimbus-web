import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-medium text-foreground">{label}</span>}
      {children}
      {error ? (
        <span className="flex items-center gap-1 text-xs text-danger">
          <Icon.alert width={13} height={13} /> {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
