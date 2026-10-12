'use client';

import { useState } from "react";
import { Avatar, Button, Field, Input } from "../../../components/ui";
import { useStore } from "../../../store";
import { SettingsSection } from "./SettingsSection";

export function ProfileTab() {
  const { members } = useStore();
  const me = members[0];
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col gap-5 animate-fade">
      <SettingsSection title="Información personal" desc="Actualiza tu foto de perfil y datos personales.">
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={me.name} color={me.color} size={64} />
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
      </SettingsSection>
    </div>
  );
}
