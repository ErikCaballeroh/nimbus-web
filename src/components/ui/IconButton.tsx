'use client';

import type { ButtonHTMLAttributes } from "react";

export function IconButton({
  className = "",
  children,
  active,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
