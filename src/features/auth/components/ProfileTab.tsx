'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Field, Input } from "@/components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "@/lib/apiClient";
import { useCurrentUser } from "@/features/auth/CurrentUserContext";
import { SettingsSection } from "./SettingsSection";

export function ProfileTab() {
  const router = useRouter();
  const me = useCurrentUser();
  const [f, setF] = useState({ name: me.name, email: me.email });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setErr({});
    setSaving(true);
    try {
      await apiFetch("/api/me", { method: "PATCH", body: JSON.stringify(f) });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      if (e instanceof ApiClientError) {
        if (e.code === "VALIDATION_ERROR") setErr(fieldErrorsFromDetails(e.details));
        else if (e.code === "CONFLICT") setErr({ email: e.message });
        else setErr({ form: e.message });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade">
      <SettingsSection title="Información personal" desc="Actualiza tu nombre y correo electrónico.">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={me.name} color={me.avatarColor} size={64} />
        </div>
        {err.form && <p className="mb-4 text-[13px] text-danger">{err.form}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" error={err.name}>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={!!err.name} />
          </Field>
          <Field label="Correo electrónico" error={err.email}>
            <Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={!!err.email} />
          </Field>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          {saved && <span className="text-[13px] text-success">Cambios guardados ✓</span>}
          <Button onClick={save} disabled={saving}>Guardar cambios</Button>
        </div>
      </SettingsSection>
    </div>
  );
}
