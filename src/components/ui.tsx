'use client';

import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Icon } from "./icons";
import { initials, priorityMeta, statusMeta, type Priority, type Status, type Member } from "../lib/data";

/* ---------------- Button ---------------- */
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

export function IconButton({
  className = "",
  children,
  active,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Inputs ---------------- */
export function Field({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: ReactNode }) {
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

const fieldCls = (error?: boolean) =>
  `w-full rounded-lg border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 ${error ? "border-danger focus:ring-danger/30" : "border-border-strong focus:border-primary"
  }`;

export function Input({ error, className = "", ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={`h-10 ${fieldCls(error)} ${className}`} {...rest} />;
}

export function Textarea({ error, className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea className={`py-2.5 min-h-24 resize-none ${fieldCls(error)} ${className}`} {...rest} />;
}

export function PasswordInput({ error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} error={error} className="pr-10" {...rest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <Icon.eyeOff width={17} height={17} /> : <Icon.eye width={17} height={17} />}
      </button>
    </div>
  );
}

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

/* ---------------- Toggle ---------------- */
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${checked ? "bg-primary" : "bg-border-strong"
        }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : ""
          }`}
      />
    </button>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({ member, size = 32 }: { member: Member; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-card"
      style={{ background: member.color, width: size, height: size, fontSize: size * 0.38 }}
      title={member.name}
    >
      {initials(member.name)}
    </span>
  );
}

export function AvatarStack({ members, max = 4, size = 28 }: { members: Member[]; max?: number; size?: number }) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m) => (
        <Avatar key={m.id} member={m} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold ring-2 ring-card"
          style={{ width: size, height: size, fontSize: size * 0.36 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

/* ---------------- Badges ---------------- */
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

export function StatusPill({ status }: { status: Status }) {
  const m = statusMeta[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: m.accent }} />
      {m.label}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

/* ---------------- Progress ---------------- */
export function Progress({ value, color = "var(--primary)" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

/* ---------------- Modal ---------------- */
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
          <IconButton onClick={onClose} aria-label="Cerrar">
            <Icon.x width={18} height={18} />
          </IconButton>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- Dropdown ---------------- */
export function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

/* ---------------- States ---------------- */
export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">{icon}</div>
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-danger/10 text-danger">
        <Icon.alert width={26} height={26} />
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">No pudimos cargar los datos</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Ocurrió un error de conexión. Revisa tu red e inténtalo de nuevo.</p>
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}

/* ---------------- Tooltip ---------------- */
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

/* ---------------- Card ---------------- */
export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-xl border border-border bg-card shadow-[var(--shadow-sm)] ${className}`}>{children}</div>
  );
}
