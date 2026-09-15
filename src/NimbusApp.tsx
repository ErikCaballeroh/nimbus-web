'use client';

import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store";
import { Auth } from "./screens/Auth";
import { Dashboard } from "./screens/Dashboard";
import { Projects } from "./screens/Projects";
import { Board } from "./screens/Board";
import { Members } from "./screens/Members";
import { Notifications } from "./screens/Notifications";
import { Settings } from "./screens/Settings";
import { Header, Sidebar, type Route } from "./components/Shell";
import { Card, ErrorState } from "./components/ui";
import { members } from "./lib/data";

export default function NimbusApp() {
    return <StoreProvider><Root /></StoreProvider>;
}

function Root() {
    const [authed, setAuthed] = useState(false);
    const [route, setRoute] = useState<Route>({ name: "dashboard" });
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);
    const { projects } = useStore();

    const go = (next: Route) => {
        setRoute(next);
        setLoading(true);
        setErrored(false);
    };

    useEffect(() => {
        if (!authed) return;
        const timer = window.setTimeout(() => setLoading(false), 650);
        return () => window.clearTimeout(timer);
    }, [route, authed]);

    if (!authed) return <Auth onAuthed={() => setAuthed(true)} />;

    const activeProject = route.name === "board" || route.name === "members"
        ? projects.find((project) => project.id === route.projectId)
        : undefined;
    const titles: Record<string, { title: string; subtitle?: string }> = {
        dashboard: { title: "Dashboard", subtitle: "Buenos días, Ana. Esto es lo que ocurre hoy." },
        projects: { title: "Proyectos", subtitle: "Gestiona y supervisa todos tus proyectos." },
        team: { title: "Equipos", subtitle: "Las personas que hacen posible el trabajo." },
        notifications: { title: "Notificaciones", subtitle: "Tu historial de actividad." },
        settings: { title: "Configuración", subtitle: "Gestiona tu cuenta y preferencias." },
    };
    const heading = route.name === "board"
        ? { title: activeProject?.name ?? "Tablero", subtitle: "Tablero Kanban" }
        : route.name === "members"
            ? { title: activeProject?.name ?? "Miembros", subtitle: "Miembros del proyecto" }
            : titles[route.name];

    return (
        <div className="flex h-full overflow-hidden bg-background">
            <Sidebar route={route} go={go} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    title={heading?.title ?? ""}
                    subtitle={heading?.subtitle}
                    go={go}
                    onLogout={() => { setAuthed(false); setRoute({ name: "dashboard" }); }}
                    actions={route.name === "board" || route.name === "members" ? (
                        <div className="hidden items-center rounded-lg border border-border bg-card p-0.5 lg:flex">
                            <TabButton active={route.name === "board"} onClick={() => go({ name: "board", projectId: route.projectId })}>Tablero</TabButton>
                            <TabButton active={route.name === "members"} onClick={() => go({ name: "members", projectId: route.projectId })}>Miembros</TabButton>
                        </div>
                    ) : undefined}
                />
                <main className="flex-1 overflow-y-auto">
                    {errored ? <div className="mx-auto max-w-3xl px-6 py-10"><ErrorState onRetry={() => { setErrored(false); setLoading(true); }} /></div> : (
                        <>
                            {route.name === "dashboard" && <Dashboard loading={loading} go={go} />}
                            {route.name === "projects" && <Projects loading={loading} go={go} />}
                            {route.name === "board" && <Board projectId={route.projectId} loading={loading} />}
                            {route.name === "members" && <Members projectId={route.projectId} />}
                            {route.name === "team" && <Team />}
                            {route.name === "notifications" && <Notifications />}
                            {route.name === "settings" && <Settings initialTab={route.tab} />}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return <button onClick={onClick} className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{children}</button>;
}

function Team() {
    const { projects, tasks } = useStore();
    return <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
            const assigned = tasks.filter((task) => task.assigneeId === member.id).length;
            const inProjects = projects.filter((project) => project.memberIds.includes(member.id)).length;
            return <Card key={member.id} className="p-5 transition-shadow hover:shadow-[var(--shadow-md)]"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white" style={{ background: member.color }}>{member.name.split(" ").map((name) => name[0]).join("")}</span><div className="min-w-0"><div className="truncate font-medium text-foreground">{member.name}</div><div className="truncate text-[13px] text-muted-foreground">{member.role}</div></div></div><div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm"><div><div className="text-lg font-semibold text-foreground">{assigned}</div><div className="text-xs text-muted-foreground">tareas</div></div><div><div className="text-lg font-semibold text-foreground">{inProjects}</div><div className="text-xs text-muted-foreground">proyectos</div></div></div></Card>;
        })}
    </div></div>;
}
