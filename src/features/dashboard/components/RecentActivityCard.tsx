import { useRouter } from "next/navigation";
import { Avatar, Card, Icon } from "../../../components/ui";
import { relTime } from "../../../lib/utils";
import type { Notification } from "../../notifications/types";

export function RecentActivityCard({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  return (
    <Card className="flex flex-col p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Actividad reciente</h3>
      <div className="flex flex-1 flex-col gap-4">
        {notifications.length === 0 && <p className="text-[13px] text-muted-foreground">Sin actividad reciente.</p>}
        {notifications.map((n) => (
          <div key={n.id} className="flex gap-3">
            {n.actorName ? (
              <Avatar name={n.actorName} color={n.actorAvatarColor ?? "#94a3b8"} size={30} />
            ) : (
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Icon.clock width={14} height={14} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-foreground">
                {n.actorName && <span className="font-medium">{n.actorName}</span>} {n.text}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{relTime(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => router.push("/notifications")} className="mt-4 text-[13px] font-medium text-primary hover:underline">
        Ver todo el historial
      </button>
    </Card>
  );
}
