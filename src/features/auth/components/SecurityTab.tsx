import { Button, Field, Icon, PasswordInput } from "../../../components/ui";
import { SettingsSection } from "./SettingsSection";

const sessions = [
  { device: "MacBook Pro · Chrome", loc: "Madrid, España", time: "Sesión actual", current: true },
  { device: "iPhone 15 · Safari", loc: "Madrid, España", time: "hace 2 h", current: false },
  { device: "Windows · Edge", loc: "Barcelona, España", time: "hace 3 d", current: false },
];

export function SecurityTab() {
  return (
    <div className="flex flex-col gap-5 animate-fade">
      <SettingsSection title="Cambiar contraseña" desc="Usa una contraseña segura que no utilices en otros sitios.">
        <div className="grid gap-4 sm:max-w-md">
          <Field label="Contraseña actual"><PasswordInput placeholder="••••••••" /></Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres con números y símbolos"><PasswordInput placeholder="••••••••" /></Field>
          <Field label="Confirmar nueva contraseña"><PasswordInput placeholder="••••••••" /></Field>
        </div>
        <div className="mt-5 flex justify-end"><Button>Actualizar contraseña</Button></div>
      </SettingsSection>

      <SettingsSection title="Autenticación en dos pasos" desc="Añade una capa extra de seguridad a tu cuenta.">
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
      </SettingsSection>

      <SettingsSection title="Sesiones activas" desc="Dispositivos donde tu cuenta está conectada actualmente.">
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
      </SettingsSection>
    </div>
  );
}
