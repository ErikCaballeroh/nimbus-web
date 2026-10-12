'use client';

import { useState } from "react";
import { Field, Icon, Select, Toggle } from "../../../components/ui";
import { useStore } from "../../../store";
import { SettingsSection } from "./SettingsSection";

export function PreferencesTab() {
  const { theme, toggleTheme } = useStore();
  const [prefs, setPrefs] = useState({ email: true, push: true, weekly: false, mentions: true });
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

      <SettingsSection title="Idioma y región" desc="Configura el idioma de la interfaz.">
        <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
          <Field label="Idioma"><Select defaultValue="es"><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></Select></Field>
          <Field label="Zona horaria"><Select defaultValue="madrid"><option value="madrid">Madrid (GMT+2)</option><option value="mexico">Ciudad de México</option><option value="bogota">Bogotá</option></Select></Field>
        </div>
      </SettingsSection>

      <SettingsSection title="Notificaciones" desc="Elige cómo y cuándo quieres recibir avisos.">
        <div className="flex flex-col divide-y divide-border">
          {[
            { key: "email", label: "Notificaciones por correo", desc: "Recibe un resumen de la actividad importante." },
            { key: "push", label: "Notificaciones push", desc: "Avisos en tiempo real en el navegador." },
            { key: "mentions", label: "Menciones y asignaciones", desc: "Cuando alguien te menciona o asigna una tarea." },
            { key: "weekly", label: "Resumen semanal", desc: "Un informe cada lunes por la mañana." },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <div className="text-[13px] font-medium text-foreground">{row.label}</div>
                <div className="text-xs text-muted-foreground">{row.desc}</div>
              </div>
              <Toggle checked={prefs[row.key as keyof typeof prefs]} onChange={(v) => setPrefs({ ...prefs, [row.key]: v })} />
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
