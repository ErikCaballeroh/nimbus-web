'use client';

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { CurrentUser } from "../../features/auth/types";
import type { ProjectListItem } from "../../features/projects/types";
import { CurrentUserProvider } from "../../features/auth/CurrentUserContext";
import { ThemeProvider } from "../providers/ThemeProvider";
import { StoreProvider } from "../../store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

function headingForPath(pathname: string) {
  if (pathname === "/dashboard") return { title: "Dashboard", subtitle: "Buenos días. Esto es lo que ocurre hoy." };
  if (pathname === "/projects") return { title: "Proyectos", subtitle: "Gestiona y supervisa todos tus proyectos." };
  if (pathname === "/team") return { title: "Equipos", subtitle: "Las personas que hacen posible el trabajo." };
  if (pathname === "/notifications") return { title: "Notificaciones", subtitle: "Tu historial de actividad." };
  if (pathname === "/settings") return { title: "Configuración", subtitle: "Gestiona tu cuenta y preferencias." };
  if (pathname.endsWith("/board")) return { title: "Tablero", subtitle: "Tablero Kanban" };
  if (pathname.endsWith("/members")) return { title: "Miembros", subtitle: "Miembros del proyecto" };
  return { title: "Nimbus" };
}

async function persistTheme(theme: "light" | "dark") {
  const res = await fetch("/api/me/theme", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  });
  if (!res.ok) throw new Error("No se pudo guardar el tema");
}

export function AppShell({
  user,
  projects,
  children,
}: {
  user: CurrentUser;
  projects: ProjectListItem[];
  children: ReactNode;
}) {
  return (
    <CurrentUserProvider user={user}>
      <ThemeProvider initialTheme={user.theme} onChange={persistTheme}>
        <StoreProvider>
          <AppShellContent projects={projects}>{children}</AppShellContent>
        </StoreProvider>
      </ThemeProvider>
    </CurrentUserProvider>
  );
}

function AppShellContent({ projects, children }: { projects: ProjectListItem[]; children: ReactNode }) {
  const pathname = usePathname();
  const heading = headingForPath(pathname);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <Sidebar projects={projects} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={heading.title} subtitle={heading.subtitle} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
