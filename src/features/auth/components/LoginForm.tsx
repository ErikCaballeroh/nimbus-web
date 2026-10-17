'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, PasswordInput, Spinner } from "@/components/ui";
import { apiFetch, ApiClientError, fieldErrorsFromDetails } from "@/lib/apiClient";
import { AuthHeader } from "./AuthShell";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr({});
    setLoading(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pw }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiClientError) {
        if (e.code === "VALIDATION_ERROR") setErr(fieldErrorsFromDetails(e.details));
        else setErr({ form: e.message });
      } else {
        setErr({ form: "Ha ocurrido un error inesperado." });
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <AuthHeader title="Bienvenida de nuevo" sub="Inicia sesión para continuar con tus proyectos." />
      <div className="flex flex-col gap-4">
        {err.form && <p className="text-[13px] text-danger">{err.form}</p>}
        <Field label="Correo electrónico" error={err.email}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" error={!!err.email} />
        </Field>
        <Field label="Contraseña" error={err.password}>
          <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" error={!!err.password} />
        </Field>
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
