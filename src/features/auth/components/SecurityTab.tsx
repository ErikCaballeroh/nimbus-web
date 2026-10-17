'use client';

import { useState } from "react";
import { Button, Field, PasswordInput } from "@/components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "@/lib/apiClient";
import { SettingsSection } from "./SettingsSection";

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
    </div>
  );
}
