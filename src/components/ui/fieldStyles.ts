export const fieldCls = (error?: boolean) =>
  `w-full rounded-lg border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
    error ? "border-danger focus:ring-danger/30" : "border-border-strong focus:border-primary"
  }`;
