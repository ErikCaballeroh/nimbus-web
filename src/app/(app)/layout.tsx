'use client';

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { StoreProvider } from "../../store";

function headingForPath(pathname: string) {
  if (pathname === "/dashboard") return { title: "Dashboard", subtitle: "Buenos días, Ana. Esto es lo que ocurre hoy." };
  if (pathname === "/projects") return { title: "Proyectos", subtitle: "Gestiona y supervisa todos tus proyectos." };
  if (pathname === "/team") return { title: "Equipos", subtitle: "Las personas que hacen posible el trabajo." };
  if (pathname === "/notifications") return { title: "Notificaciones", subtitle: "Tu historial de actividad." };
  if (pathname === "/settings") return { title: "Configuración", subtitle: "Gestiona tu cuenta y preferencias." };
  if (pathname.endsWith("/board")) return { title: "Tablero", subtitle: "Tablero Kanban" };
  if (pathname.endsWith("/members")) return { title: "Miembros", subtitle: "Miembros del proyecto" };
  return { title: "Nimbus" };
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </StoreProvider>
  );
}

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const heading = headingForPath(pathname);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={heading.title} subtitle={heading.subtitle} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
