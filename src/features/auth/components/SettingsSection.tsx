import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export function SettingsSection({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mb-5 mt-0.5 text-[13px] text-muted-foreground">{desc}</p>
      {children}
    </Card>
  );
}
