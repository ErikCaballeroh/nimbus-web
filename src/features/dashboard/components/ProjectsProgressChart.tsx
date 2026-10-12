import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Card } from "../../../components/ui";
import { chartColors, tooltipStyle } from "./chartTheme";

export function ProjectsProgressChart({
  data,
  theme,
}: {
  data: { name: string; total: number; done: number }[];
  theme: string;
}) {
  const { grid, axis } = chartColors(theme);
  return (
    <Card className="p-5 lg:col-span-2">
      <h3 className="mb-4 text-[15px] font-semibold text-foreground">Tareas por proyecto</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis dataKey="name" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
          <RTooltip contentStyle={tooltipStyle(theme)} cursor={{ fill: "color-mix(in srgb, var(--muted-foreground) 8%, transparent)" }} />
          <Bar dataKey="total" fill="var(--border-strong)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="done" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
