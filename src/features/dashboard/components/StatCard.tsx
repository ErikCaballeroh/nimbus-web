import { Card, Icon } from "@/components/ui";

export function StatCard({
  label,
  value,
  icon: Icn,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Icon.projects;
  tone: string;
}) {
  return (
    <Card className="animate-rise p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}>
        <Icn width={20} height={20} />
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-0.5 text-[13px] text-muted-foreground">{label}</div>
    </Card>
  );
}
