'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, PasswordInput, Spinner } from "../../../components/ui";
import { AuthHeader } from "./AuthShell";

export function RegisterForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", pw: "", confirm: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (f.name.trim().length < 2) n.name = "Introduce tu nombre";
    if (!f.email.includes("@")) n.email = "Correo no válido";
    if (f.pw.length < 6) n.pw = "Mínimo 6 caracteres";
    if (f.confirm !== f.pw) n.confirm = "Las contraseñas no coinciden";
    setErr(n);
    if (Object.keys(n).length) return;
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 900);
  };

  const strength = Math.min(4, Math.floor(f.pw.length / 3));
  return (
    <form onSubmit={submit}>
      <AuthHeader title="Crea tu cuenta" sub="Empieza gratis, sin tarjeta de crédito." />
      <div className="flex flex-col gap-4">
        <Field label="Nombre completo" error={err.name}>
          <Input value={f.name} onChange={set("name")} placeholder="Ana García" error={!!err.name} />
        </Field>
        <Field label="Correo electrónico" error={err.email}>
          <Input value={f.email} onChange={set("email")} placeholder="tu@empresa.com" error={!!err.email} />
        </Field>
        <Field label="Contraseña" error={err.pw} hint={!err.pw ? "Usa 8+ caracteres con números" : undefined}>
          <PasswordInput value={f.pw} onChange={set("pw")} placeholder="••••••••" error={!!err.pw} />
        </Field>
        {f.pw && (
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
        <Field label="Confirmar contraseña" error={err.confirm}>
          <PasswordInput value={f.confirm} onChange={set("confirm")} placeholder="••••••••" error={!!err.confirm} />
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
