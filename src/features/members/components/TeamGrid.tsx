import { Card } from "@/components/ui";
import type { TeamMember } from "@/features/team/types";

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <Card key={member.id} className="p-5 transition-shadow hover:shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white" style={{ background: member.avatarColor }}>
                {member.name.split(" ").map((name) => name[0]).join("")}
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{member.name}</div>
                <div className="truncate text-[13px] text-muted-foreground">{member.email}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm">
              <div><div className="text-lg font-semibold text-foreground">{member.taskCount}</div><div className="text-xs text-muted-foreground">tareas</div></div>
              <div><div className="text-lg font-semibold text-foreground">{member.projectCount}</div><div className="text-xs text-muted-foreground">proyectos</div></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
