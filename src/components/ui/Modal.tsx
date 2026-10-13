'use client';

import { useEffect, type ReactNode } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { es } from "@/lib/i18n/es";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="animate-overlay fixed inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`animate-modal relative z-10 mt-8 w-full ${w} rounded-xl border border-border bg-card shadow-[var(--shadow-lg)]`}>
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
          </div>
          <IconButton onClick={onClose} aria-label={es.common.modal.close}>
            <Icon.x width={18} height={18} />
          </IconButton>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
