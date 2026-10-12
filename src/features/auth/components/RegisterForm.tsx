'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, PasswordInput, Spinner } from "../../../components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "../../../lib/apiClient";
import { AuthHeader } from "./AuthShell";

export function RegisterForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(f) });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiClientError) {
        if (e.code === "VALIDATION_ERROR") setErr(fieldErrorsFromDetails(e.details));
        else if (e.code === "CONFLICT") setErr({ email: e.message });
        else setErr({ form: e.message });
      } else {
        setErr({ form: "Ha ocurrido un error inesperado." });
      }
      setLoading(false);
    }
  };

  const strength = Math.min(4, Math.floor(f.password.length / 3));
  return (
    <form onSubmit={submit}>
      <AuthHeader title="Crea tu cuenta" sub="Empieza gratis, sin tarjeta de crédito." />
      <div className="flex flex-col gap-4">
        {err.form && <p className="text-[13px] text-danger">{err.form}</p>}
        <Field label="Nombre completo" error={err.name}>
          <Input value={f.name} onChange={set("name")} placeholder="Ana García" error={!!err.name} />
        </Field>
        <Field label="Correo electrónico" error={err.email}>
          <Input value={f.email} onChange={set("email")} placeholder="tu@empresa.com" error={!!err.email} />
        </Field>
        <Field label="Contraseña" error={err.password} hint={!err.password ? "Usa 8+ caracteres con números" : undefined}>
          <PasswordInput value={f.password} onChange={set("password")} placeholder="••••••••" error={!!err.password} />
        </Field>
        {f.password && (
          <div className="-mt-1 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ background: i < strength ? ["#dc2626", "#d97706", "#ca8a04", "#16a34a"][strength - 1] : "var(--secondary)" }}
              />
            ))}
          </div>
        )}
        <Field label="Confirmar contraseña" error={err.confirmPassword}>
          <PasswordInput value={f.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" error={!!err.confirmPassword} />
        </Field>
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? <Spinner /> : "Crear cuenta"}
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
