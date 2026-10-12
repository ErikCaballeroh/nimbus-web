'use client';

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Icon, IconButton, Tooltip } from "../ui";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useStore } from "../../store";
import { useTheme } from "../providers/ThemeProvider";
import { useCurrentUser } from "../../features/auth/CurrentUserContext";
import { relTime } from "../../lib/utils";

export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const me = useCurrentUser();
  const { members, notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const notifRef = useClickOutside<HTMLDivElement>(() => setOpenNotif(false));
  const userRef = useClickOutside<HTMLDivElement>(() => setOpenUser(false));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-md sm:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[19px] font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="relative hidden md:block">
        <Icon.search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Buscar…"
          className="h-9.5 w-56 rounded-lg border border-border-strong bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all focus:w-72 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {actions}

      <Tooltip label={theme === "light" ? "Modo oscuro" : "Modo claro"}>
        <IconButton onClick={toggleTheme}>
          {theme === "light" ? <Icon.moon width={19} height={19} /> : <Icon.sun width={19} height={19} />}
        </IconButton>
      </Tooltip>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <IconButton active={openNotif} onClick={() => setOpenNotif((o) => !o)}>
          <div className="relative">
            <Icon.bell width={19} height={19} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white ring-2 ring-background">
                {unread}
              </span>
            )}
          </div>
        </IconButton>
        {openNotif && (
          <div className="animate-dropdown absolute right-0 top-12 z-50 w-88 overflow-hidden rounded-xl border border-border bg-popover shadow-[var(--shadow-lg)]" style={{ width: 360 }}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Notificaciones</span>
              <Link
                href="/notifications"
                onClick={() => setOpenNotif(false)}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => {
                const actor = members.find((m) => m.id === n.actorId)!;
                return (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 transition-colors hover:bg-secondary ${!n.read ? "bg-accent/40" : ""}`}>
                    <Avatar name={actor.name} color={actor.color} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-foreground">
                        <span className="font-medium">{actor.name}</span> {n.text}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{relTime(n.time)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => setOpenUser((o) => !o)}
          className="rounded-full transition-transform active:scale-95"
          aria-label="Menú de usuario"
        >
          <Avatar name={me.name} color={me.avatarColor} size={36} />
        </button>
        {openUser && (
          <div className="animate-dropdown absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-popover py-1.5 shadow-[var(--shadow-lg)]">
            <div className="border-b border-border px-3 pb-2.5 pt-1.5">
              <div className="text-sm font-medium text-foreground">{me.name}</div>
              <div className="text-xs text-muted-foreground">{me.email}</div>
            </div>
            {[
              { label: "Mi perfil", icon: Icon.user, tab: "profile" },
              { label: "Preferencias", icon: Icon.settings, tab: "preferences" },
              { label: "Seguridad", icon: Icon.shield, tab: "security" },
            ].map((it) => (
              <Link
                key={it.label}
                href={`/settings?tab=${it.tab}`}
                onClick={() => setOpenUser(false)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-secondary"
              >
                <it.icon width={16} height={16} className="text-muted-foreground" /> {it.label}
              </Link>
            ))}
            <div className="my-1 border-t border-border" />
            <button
              onClick={async () => {
                setOpenUser(false);
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-danger transition-colors hover:bg-danger/8"
            >
              <Icon.logout width={16} height={16} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
