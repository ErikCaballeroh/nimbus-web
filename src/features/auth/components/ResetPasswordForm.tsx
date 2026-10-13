'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Field, Icon, PasswordInput, Spinner } from "@/components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "@/lib/apiClient";
import { AuthHeader } from "./AuthShell";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [f, setF] = useState({ password: "", confirmPassword: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  if (!token) {
    return (
      <div className="text-center animate-rise">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Enlace no válido</h1>
        <p className="mt-2 text-sm text-muted-foreground">Solicita un nuevo enlace de recuperación.</p>
        <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/recover")}>
          Ir a recuperar contraseña
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center animate-rise">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/12 text-success">
          <Icon.check_circle width={34} height={34} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">¡Contraseña restablecida!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/login")}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, ...f }) });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiClientError) {
        if (e.code === "VALIDATION_ERROR") setErr(fieldErrorsFromDetails(e.details));
        else setErr({ form: e.message });
      } else {
        setErr({ form: "Ha ocurrido un error inesperado." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <AuthHeader title="Nueva contraseña" sub="Elige una contraseña segura para tu cuenta." />
      <div className="flex flex-col gap-4">
        {err.form && <p className="text-[13px] text-danger">{err.form}</p>}
        <Field label="Nueva contraseña" error={err.password}>
          <PasswordInput value={f.password} onChange={set("password")} placeholder="••••••••" error={!!err.password} />
        </Field>
        <Field label="Confirmar contraseña" error={err.confirmPassword}>
          <PasswordInput value={f.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" error={!!err.confirmPassword} />
        </Field>
      </div>
      <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full">
        {loading ? <Spinner /> : "Restablecer contraseña"}
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver a inicio de sesión
        </Link>
      </p>
    </form>
  );
}
