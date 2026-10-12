'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Icon } from "../ui";
import { useStore } from "../../store";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Icon.dashboard },
  { href: "/projects", label: "Proyectos", icon: Icon.projects },
  { href: "/team", label: "Equipos", icon: Icon.team },
  { href: "/settings", label: "Configuración", icon: Icon.settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { projects, members } = useStore();
  const me = members[0];

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Icon.logo />
        <span className="text-[17px] font-semibold tracking-tight">Nimbus</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 py-2">
        {nav.map((n) => {
          const on = n.href === "/projects" ? pathname.startsWith("/projects") : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${on ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <n.icon width={18} height={18} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Proyectos
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {projects.map((p) => {
          const on = pathname === `/projects/${p.id}/board` || pathname === `/projects/${p.id}/members`;
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}/board`}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${on ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <Avatar name={me.name} color={me.color} size={34} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-foreground">{me.name}</div>
            <div className="truncate text-xs text-muted-foreground">{me.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
