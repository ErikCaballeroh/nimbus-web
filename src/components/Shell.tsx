'use client';

import { useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { Avatar, IconButton, Tooltip, useClickOutside } from "./ui";
import { useStore } from "../store";
import { members, relTime } from "../lib/data";

export type Route =
  | { name: "dashboard" }
  | { name: "projects" }
  | { name: "board"; projectId: string }
  | { name: "members"; projectId: string }
  | { name: "team" }
  | { name: "notifications" }
  | { name: "settings"; tab?: "profile" | "preferences" | "security" };

const nav = [
  { key: "dashboard", label: "Dashboard", icon: Icon.dashboard },
  { key: "projects", label: "Proyectos", icon: Icon.projects },
  { key: "team", label: "Equipos", icon: Icon.team },
  { key: "settings", label: "Configuración", icon: Icon.settings },
] as const;

export function Sidebar({ route, go }: { route: Route; go: (r: Route) => void }) {
  const { projects } = useStore();
  const active = route.name === "board" || route.name === "members" ? "projects" : route.name;
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Icon.logo />
        <span className="text-[17px] font-semibold tracking-tight">Nimbus</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-2">
        {nav.map((n) => {
          const on = active === n.key;
          return (
            <button
              key={n.key}
              onClick={() => go({ name: n.key } as Route)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${on ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <n.icon width={18} height={18} />
              {n.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Proyectos
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {projects.map((p) => {
          const on = (route.name === "board" || route.name === "members") && route.projectId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => go({ name: "board", projectId: p.id })}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${on ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <Avatar member={members[0]} size={34} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-foreground">{members[0].name}</div>
            <div className="truncate text-xs text-muted-foreground">{members[0].email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Header({
  title,
  subtitle,
  actions,
  go,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  go: (r: Route) => void;
  onLogout: () => void;
}) {
  const { theme, toggleTheme, notifications } = useStore();
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
              <button
                onClick={() => { go({ name: "notifications" }); setOpenNotif(false); }}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                Ver todas
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => {
                const actor = members.find((m) => m.id === n.actorId)!;
                return (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 transition-colors hover:bg-secondary ${!n.read ? "bg-accent/40" : ""}`}>
                    <Avatar member={actor} size={32} />
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
        <button onClick={() => setOpenUser((o) => !o)} className="rounded-full transition-transform active:scale-95">
          <Avatar member={members[0]} size={36} />
        </button>
        {openUser && (
          <div className="animate-dropdown absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-border bg-popover py-1.5 shadow-[var(--shadow-lg)]">
            <div className="border-b border-border px-3 pb-2.5 pt-1.5">
              <div className="text-sm font-medium text-foreground">{members[0].name}</div>
              <div className="text-xs text-muted-foreground">{members[0].email}</div>
            </div>
            {[
              { label: "Mi perfil", icon: Icon.user, tab: "profile" as const },
              { label: "Preferencias", icon: Icon.settings, tab: "preferences" as const },
              { label: "Seguridad", icon: Icon.shield, tab: "security" as const },
            ].map((it) => (
              <button
                key={it.label}
                onClick={() => { go({ name: "settings", tab: it.tab }); setOpenUser(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-secondary"
              >
                <it.icon width={16} height={16} className="text-muted-foreground" /> {it.label}
              </button>
            ))}
            <div className="my-1 border-t border-border" />
            <button
              onClick={onLogout}
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
