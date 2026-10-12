'use client';

import { useState } from "react";
import { Icon } from "../components/icons";
import { Avatar, Button, Card, Field, Input, PasswordInput, Select, Toggle } from "../components/ui";
import { useStore } from "../store";
import { members } from "../lib/data";

type Tab = "profile" | "preferences" | "security";

const tabs: { key: Tab; label: string; icon: typeof Icon.user }[] = [
  { key: "profile", label: "Perfil", icon: Icon.user },
  { key: "preferences", label: "Preferencias", icon: Icon.settings },
  { key: "security", label: "Seguridad", icon: Icon.shield },
];

export function Settings({ initialTab = "profile" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <div className="mx-auto max-w-4xl px-5 py-6 sm:px-6">
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <t.icon width={16} height={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <Profile />}
      {tab === "preferences" && <Preferences />}
      {tab === "security" && <Security />}
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mb-5 mt-0.5 text-[13px] text-muted-foreground">{desc}</p>
      {children}
    </Card>
  );
}

function Profile() {
  const me = members[0];
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col gap-5 animate-fade">
      <Section title="Información personal" desc="Actualiza tu foto de perfil y datos personales.">
        <div className="mb-6 flex items-center gap-4">
          <Avatar member={me} size={64} />
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Cambiar foto</Button>
            <Button variant="ghost" size="sm">Eliminar</Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo"><Input defaultValue={me.name} /></Field>
          <Field label="Cargo"><Input defaultValue="Product Manager" /></Field>
          <Field label="Correo electrónico"><Input defaultValue={me.email} /></Field>
          <Field label="Teléfono"><Input defaultValue="+34 612 345 678" /></Field>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          {saved && <span className="text-[13px] text-success">Cambios guardados ✓</span>}
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>Guardar cambios</Button>
        </div>
      </Section>
    </div>
  );
}

function Preferences() {
  const { theme, toggleTheme } = useStore();
  const [prefs, setPrefs] = useState({ email: true, push: true, weekly: false, mentions: true });
  return (
    <div className="flex flex-col gap-5 animate-fade">
      <Section title="Apariencia" desc="Personaliza cómo se ve Nimbus para ti.">
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
      </Section>

      <Section title="Idioma y región" desc="Configura el idioma de la interfaz.">
        <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
          <Field label="Idioma"><Select defaultValue="es"><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></Select></Field>
          <Field label="Zona horaria"><Select defaultValue="madrid"><option value="madrid">Madrid (GMT+2)</option><option value="mexico">Ciudad de México</option><option value="bogota">Bogotá</option></Select></Field>
        </div>
      </Section>

      <Section title="Notificaciones" desc="Elige cómo y cuándo quieres recibir avisos.">
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
      </Section>
    </div>
  );
}

function Security() {
  const sessions = [
    { device: "MacBook Pro · Chrome", loc: "Madrid, España", time: "Sesión actual", current: true },
    { device: "iPhone 15 · Safari", loc: "Madrid, España", time: "hace 2 h", current: false },
    { device: "Windows · Edge", loc: "Barcelona, España", time: "hace 3 d", current: false },
  ];
  return (
    <div className="flex flex-col gap-5 animate-fade">
      <Section title="Cambiar contraseña" desc="Usa una contraseña segura que no utilices en otros sitios.">
        <div className="grid gap-4 sm:max-w-md">
          <Field label="Contraseña actual"><PasswordInput placeholder="••••••••" /></Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres con números y símbolos"><PasswordInput placeholder="••••••••" /></Field>
          <Field label="Confirmar nueva contraseña"><PasswordInput placeholder="••••••••" /></Field>
        </div>
        <div className="mt-5 flex justify-end"><Button>Actualizar contraseña</Button></div>
      </Section>

      <Section title="Autenticación en dos pasos" desc="Añade una capa extra de seguridad a tu cuenta.">
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon.shield width={18} height={18} /></span>
            <div>
              <div className="text-[13px] font-medium text-foreground">Aplicación de autenticación</div>
              <div className="text-xs text-muted-foreground">Recomendado · No configurado</div>
            </div>
          </div>
          <Button variant="secondary" size="sm">Activar</Button>
        </div>
      </Section>

      <Section title="Sesiones activas" desc="Dispositivos donde tu cuenta está conectada actualmente.">
        <div className="flex flex-col divide-y divide-border">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground"><Icon.device width={18} height={18} /></span>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                  {s.device}
                  {s.current && <span className="rounded-md bg-success/12 px-1.5 py-0.5 text-[11px] font-medium text-success">Actual</span>}
                </div>
                <div className="text-xs text-muted-foreground">{s.loc} · {s.time}</div>
              </div>
              {!s.current && <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/8">Cerrar</Button>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
