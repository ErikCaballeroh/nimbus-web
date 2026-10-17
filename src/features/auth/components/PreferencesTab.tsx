'use client';

import { Icon } from "@/components/ui";
import { useTheme } from "@/components/providers/ThemeProvider";
import { SettingsSection } from "./SettingsSection";

export function PreferencesTab() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex flex-col gap-5 animate-fade">
      <SettingsSection title="Apariencia" desc="Personaliza cómo se ve Nimbus para ti.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:max-w-md">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { if (theme !== t) toggleTheme(); }}
              className={`rounded-xl border-2 p-3 text-left transition-all active:scale-[0.98] ${theme === t ? "border-primary" : "border-border-strong hover:border-muted-foreground"}`}
            >
              <div className={`mb-2.5 h-16 rounded-lg border ${t === "light" ? "bg-[#f7f8fa] border-[#e6e8ec]" : "bg-[#0d0f12] border-[#262a31]"}`}>
                <div className={`m-2 h-2 w-10 rounded-full ${t === "light" ? "bg-[#4f46e5]" : "bg-[#6366f1]"}`} />
                <div className={`mx-2 h-2 w-16 rounded-full ${t === "light" ? "bg-[#e6e8ec]" : "bg-[#262a31]"}`} />
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                {t === "light" ? <Icon.sun width={15} height={15} /> : <Icon.moon width={15} height={15} />}
                {t === "light" ? "Claro" : "Oscuro"}
                {theme === t && <Icon.check width={15} height={15} className="ml-auto text-primary" />}
              </div>
            </button>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
