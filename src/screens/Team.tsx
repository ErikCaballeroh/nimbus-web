'use client';

import { Card } from "../components/ui";
import { members } from "../lib/data";
import { useStore } from "../store";

export function Team() {
    const { projects, tasks } = useStore();

    return (
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => {
                    const assigned = tasks.filter((task) => task.assigneeId === member.id).length;
                    const inProjects = projects.filter((project) => project.memberIds.includes(member.id)).length;

                    return (
                        <Card key={member.id} className="p-5 transition-shadow hover:shadow-[var(--shadow-md)]">
                            <div className="flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white" style={{ background: member.color }}>
                                    {member.name.split(" ").map((name) => name[0]).join("")}
                                </span>
                                <div className="min-w-0">
                                    <div className="truncate font-medium text-foreground">{member.name}</div>
                                    <div className="truncate text-[13px] text-muted-foreground">{member.role}</div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm">
                                <div><div className="text-lg font-semibold text-foreground">{assigned}</div><div className="text-xs text-muted-foreground">tareas</div></div>
                                <div><div className="text-lg font-semibold text-foreground">{inProjects}</div><div className="text-xs text-muted-foreground">proyectos</div></div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}