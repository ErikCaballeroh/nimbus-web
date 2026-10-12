import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "../../../components/ui";
import { chartColors, tooltipStyle } from "./chartTheme";

const burndown = [
  { d: "L", plan: 42, real: 42 },
  { d: "M", plan: 38, real: 40 },
  { d: "X", plan: 34, real: 36 },
  { d: "J", plan: 30, real: 33 },
  { d: "V", plan: 26, real: 27 },
  { d: "S", plan: 22, real: 21 },
  { d: "D", plan: 18, real: 16 },
];

export function SprintBurndownChart({ theme }: { theme: string }) {
  const { grid, axis } = chartColors(theme);
  return (
    <Card className="p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Progreso del sprint</h3>
          <p className="text-[13px] text-muted-foreground">Tareas restantes: planificado vs. real</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--primary)]" /> Real</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" /> Plan</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={burndown} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis dataKey="d" stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={axis} fontSize={12} tickLine={false} axisLine={false} />
          <RTooltip contentStyle={tooltipStyle(theme)} />
          <Line type="monotone" dataKey="plan" stroke="var(--border-strong)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="real" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
