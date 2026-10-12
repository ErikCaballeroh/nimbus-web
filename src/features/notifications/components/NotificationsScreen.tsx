'use client';

import { useMemo, useState } from "react";
import { Avatar, Button, Card, EmptyState, Icon } from "../../../components/ui";
import { relTime } from "../../../lib/utils";
import { useStore } from "../../../store";
import type { NotificationType } from "../types";

const typeMeta: Record<NotificationType, { icon: typeof Icon.user; tone: string; label: string }> = {
  assigned: { icon: Icon.user, tone: "var(--primary)", label: "Asignaciones" },
  comment: { icon: Icon.message, tone: "var(--info)", label: "Comentarios" },
  status: { icon: Icon.board, tone: "var(--success)", label: "Estados" },
  member: { icon: Icon.team, tone: "var(--warning)", label: "Miembros" },
  due: { icon: Icon.clock, tone: "var(--danger)", label: "Vencimientos" },
};

const filters = [
  { key: "all", label: "Todas" },
  { key: "unread", label: "No leídas" },
  { key: "assigned", label: "Asignaciones" },
  { key: "comment", label: "Comentarios" },
  { key: "status", label: "Estados" },
] as const;

export function NotificationsScreen() {
  const { notifications, members, markAllRead, toggleRead } = useStore();
  const [filter, setFilter] = useState<string>("all");

  const list = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          {unread > 0 ? `Tienes ${unread} notificaciones sin leer` : "Estás al día 🎉"}
        </p>
        <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unread === 0}>
          <Icon.check width={15} height={15} /> Marcar todas como leídas
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<Icon.bell width={26} height={26} />} title="Sin notificaciones" body="No hay notificaciones que coincidan con este filtro." />
      ) : (
        <Card className="divide-y divide-border">
          {list.map((n) => {
            const actor = members.find((m) => m.id === n.actorId)!;
            const tm = typeMeta[n.type];
            return (
              <div key={n.id} className={`flex items-start gap-3.5 px-4 py-4 transition-colors hover:bg-secondary/40 ${!n.read ? "bg-accent/30" : ""}`}>
                <div className="relative">
                  <Avatar name={actor.name} color={actor.color} size={38} />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-card" style={{ background: tm.tone }}>
                    <tm.icon width={11} height={11} className="text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-medium">{actor.name}</span> {n.text}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{relTime(n.time)}</p>
                </div>
                <button
                  onClick={() => toggleRead(n.id)}
                  className="mt-1 shrink-0 text-xs font-medium text-muted-foreground hover:text-primary"
                  title={n.read ? "Marcar como no leída" : "Marcar como leída"}
                >
                  {!n.read ? <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" /> : <span className="h-2.5 w-2.5 rounded-full border border-border-strong inline-block" />}
                </button>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
