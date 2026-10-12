'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, PasswordInput, Spinner } from "../../../components/ui";
import { AuthHeader } from "./AuthShell";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("ana.garcia@nimbus.io");
  const [pw, setPw] = useState("demo1234");
  const [err, setErr] = useState<{ email?: string; pw?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!email.includes("@")) next.email = "Introduce un correo válido";
    if (pw.length < 6) next.pw = "Mínimo 6 caracteres";
    setErr(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 850);
  };

  return (
    <form onSubmit={submit}>
      <AuthHeader title="Bienvenida de nuevo" sub="Inicia sesión para continuar con tus proyectos." />
      <div className="flex flex-col gap-4">
        <Field label="Correo electrónico" error={err.email}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" error={!!err.email} />
        </Field>
        <Field label="Contraseña" error={err.pw}>
          <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" error={!!err.pw} />
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" /> Recordarme
          </label>
          <Link href="/recover" className="text-[13px] font-medium text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? <Spinner /> : "Iniciar sesión"}
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
