import { useRouter } from "next/navigation";
import { Avatar, Card } from "../../../components/ui";
import { relTime } from "../../../lib/utils";
import type { Member } from "../../members/types";
import type { Notification } from "../../notifications/types";

export function RecentActivityCard({ notifications, members }: { notifications: Notification[]; members: Member[] }) {
  const router = useRouter();
  return (
    <Card className="flex flex-col p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Actividad reciente</h3>
      <div className="flex flex-1 flex-col gap-4">
        {notifications.slice(0, 5).map((n) => {
          const actor = members.find((m) => m.id === n.actorId)!;
          return (
            <div key={n.id} className="flex gap-3">
              <Avatar name={actor.name} color={actor.color} size={30} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-foreground">
                  <span className="font-medium">{actor.name}</span> {n.text}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{relTime(n.time)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => router.push("/notifications")} className="mt-4 text-[13px] font-medium text-primary hover:underline">
        Ver todo el historial
      </button>
    </Card>
  );
}
