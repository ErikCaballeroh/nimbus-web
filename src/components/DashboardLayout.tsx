'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Auth } from "../screens/Auth";
import { Header, Sidebar, type Route } from "./Shell";
import { StoreProvider } from "../store";

type DashboardContextValue = {
    loading: boolean;
    route: Route;
    go: (route: Route) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (!context) throw new Error("useDashboardContext must be used within DashboardLayout");
    return context;
}

export function DashboardLayout({ children }: { children: ReactNode }) {
    return <StoreProvider><DashboardLayoutContent>{children}</DashboardLayoutContent></StoreProvider>;
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [loading, setLoading] = useState(true);

    const route = useMemo(() => routeFromPath(pathname), [pathname]);

    const go = (next: Route) => {
        router.push(pathFromRoute(next));
    };

    useEffect(() => {
        if (!authed) return;
        setLoading(true);
        const timer = window.setTimeout(() => setLoading(false), 650);
        return () => window.clearTimeout(timer);
    }, [pathname, authed]);

    if (!authed) return <Auth onAuthed={() => setAuthed(true)} />;

    const heading = headingForRoute(route);
    const contextValue = { loading, route, go };

    return (
        <DashboardContext.Provider value={contextValue}>
            <div className="flex h-full overflow-hidden bg-background">
                <Sidebar route={route} go={go} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <Header
                        title={heading.title}
                        subtitle={heading.subtitle}
                        go={go}
                        onLogout={() => setAuthed(false)}
                    />
                    <main className="flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>
        </DashboardContext.Provider>
    );
}

function routeFromPath(pathname: string): Route {
    if (pathname.startsWith("/projects/") && pathname.endsWith("/members")) {
        return { name: "members", projectId: pathname.split("/")[2] };
    }
    if (pathname.startsWith("/projects/") && pathname.endsWith("/board")) {
        return { name: "board", projectId: pathname.split("/")[2] };
    }
    if (pathname === "/projects") return { name: "projects" };
    if (pathname === "/team") return { name: "team" };
    if (pathname === "/notifications") return { name: "notifications" };
    if (pathname === "/settings") return { name: "settings" };
    return { name: "dashboard" };
}

function pathFromRoute(route: Route) {
    if (route.name === "board") return `/projects/${route.projectId}/board`;
    if (route.name === "members") return `/projects/${route.projectId}/members`;
    if (route.name === "dashboard") return "/dashboard";
    return `/${route.name}`;
}

function headingForRoute(route: Route) {
    if (route.name === "dashboard") return { title: "Dashboard", subtitle: "Buenos días, Ana. Esto es lo que ocurre hoy." };
    if (route.name === "projects") return { title: "Proyectos", subtitle: "Gestiona y supervisa todos tus proyectos." };
    if (route.name === "team") return { title: "Equipos", subtitle: "Las personas que hacen posible el trabajo." };
    if (route.name === "notifications") return { title: "Notificaciones", subtitle: "Tu historial de actividad." };
    if (route.name === "settings") return { title: "Configuración", subtitle: "Gestiona tu cuenta y preferencias." };
    return { title: route.name === "board" ? "Tablero" : "Miembros", subtitle: route.name === "board" ? "Tablero Kanban" : "Miembros del proyecto" };
}