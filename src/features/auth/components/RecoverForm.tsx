'use client';

import { useState } from "react";
import Link from "next/link";
import { Button, Field, Icon, Input, Spinner } from "@/components/ui";
import { apiFetch } from "@/lib/apiClient";
import { AuthHeader } from "./AuthShell";

export function RecoverForm() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/auth/recover", { method: "POST", body: JSON.stringify({ email }) });
    } finally {
      // Always show the same confirmation, whether or not the email exists.
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <Icon.chevronLeft width={16} height={16} /> Volver a inicio de sesión
      </Link>

      {!sent ? (
        <form onSubmit={submit}>
          <AuthHeader title="Recuperar contraseña" sub="Te enviaremos un enlace para restablecer tu contraseña." />
          <Field label="Correo electrónico">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" required />
          </Field>
          <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full">
            {loading ? <Spinner /> : "Enviar enlace"}
          </Button>
        </form>
      ) : (
        <div className="text-center animate-rise">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success">
            <Icon.check_circle width={34} height={34} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Revisa tu correo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Si <strong>{email}</strong> tiene una cuenta, te enviamos un enlace para restablecer tu contraseña. El enlace caduca en 1 hora.
          </p>
        </div>
      )}
    </div>
  );
}
