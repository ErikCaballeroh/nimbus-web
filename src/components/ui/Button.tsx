'use client';

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover shadow-[var(--shadow-sm)] disabled:opacity-50",
    secondary:
      "bg-card text-foreground border border-border-strong hover:bg-secondary disabled:opacity-50",
    ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
    danger: "bg-danger text-white hover:brightness-110 shadow-[var(--shadow-sm)]",
  };
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[13px] gap-1.5 rounded-md",
    md: "h-9.5 px-4 text-sm gap-2 rounded-lg",
    lg: "h-11 px-5 text-[15px] gap-2 rounded-lg",
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
