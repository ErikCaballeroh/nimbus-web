import type { ReactNode, SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        className={`h-10 w-full appearance-none rounded-lg border border-border-strong bg-input px-3 pr-9 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary ${className}`}
        {...rest}
      >
        {children}
      </select>
      <Icon.chevronDown width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
