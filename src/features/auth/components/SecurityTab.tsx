'use client';

import { useState } from "react";
import { Button, Field, Icon, PasswordInput } from "../../../components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "../../../lib/apiClient";
import { SettingsSection } from "./SettingsSection";

const sessions = [
  { device: "Esta sesión", loc: "", time: "Sesión actual", current: true },
];

export function SecurityTab() {
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setErr({});
    setSaving(true);
    try {
      await apiFetch("/api/me/password", { method: "PATCH", body: JSON.stringify(f) });
      setF({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      if (e instanceof ApiClientError) {
        if (e.code === "VALIDATION_ERROR") setErr(fieldErrorsFromDetails(e.details));
        else setErr({ form: e.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade">
      <SettingsSection title="Cambiar contraseña" desc="Usa una contraseña segura que no utilices en otros sitios.">
        {err.form && <p className="mb-4 text-[13px] text-danger">{err.form}</p>}
        <div className="grid gap-4 sm:max-w-md">
          <Field label="Contraseña actual" error={err.currentPassword}>
            <PasswordInput
              value={f.currentPassword}
              onChange={(e) => setF({ ...f, currentPassword: e.target.value })}
              placeholder="••••••••"
              error={!!err.currentPassword}
            />
          </Field>
          <Field label="Nueva contraseña" error={err.newPassword} hint={!err.newPassword ? "Mínimo 8 caracteres" : undefined}>
            <PasswordInput
              value={f.newPassword}
              onChange={(e) => setF({ ...f, newPassword: e.target.value })}
              placeholder="••••••••"
              error={!!err.newPassword}
            />
          </Field>
          <Field label="Confirmar nueva contraseña" error={err.confirmPassword}>
            <PasswordInput
              value={f.confirmPassword}
              onChange={(e) => setF({ ...f, confirmPassword: e.target.value })}
              placeholder="••••••••"
              error={!!err.confirmPassword}
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2.5">
          {saved && <span className="text-[13px] text-success">Contraseña actualizada ✓</span>}
          <Button onClick={save} disabled={saving}>Actualizar contraseña</Button>
        </div>
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
                <div className="text-xs text-muted-foreground">{s.time}</div>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}
