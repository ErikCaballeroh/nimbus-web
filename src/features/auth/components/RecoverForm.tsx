'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Icon, Input, PasswordInput, Spinner } from "../../../components/ui";
import { AuthHeader } from "./AuthShell";

export function RecoverForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const next = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep((s) => s + 1);
    }, 700);
  };

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <Icon.chevronLeft width={16} height={16} /> Volver a inicio de sesión
      </Link>

      {/* progress */}
      <div className="mb-7 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={(e) => { e.preventDefault(); next(); }}>
          <AuthHeader title="Recuperar contraseña" sub="Te enviaremos un código de verificación a tu correo." />
          <Field label="Correo electrónico">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" required />
          </Field>
          <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full">
            {loading ? <Spinner /> : "Enviar código"}
          </Button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); next(); }}>
          <AuthHeader title="Verifica tu correo" sub={`Introduce el código de 4 dígitos enviado a ${email || "tu correo"}.`} />
          <div className="flex justify-between gap-3">
            {code.map((c, i) => (
              <input
                key={i}
                value={c}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(-1);
                  const nc = [...code];
                  nc[i] = v;
                  setCode(nc);
                  if (v && i < 3) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                }}
                inputMode="numeric"
                className="h-16 w-full rounded-xl border border-border-strong bg-input text-center text-2xl font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            ))}
          </div>
          <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full">
            {loading ? <Spinner /> : "Verificar código"}
          </Button>
          <p className="mt-4 text-center text-[13px] text-muted-foreground">
            ¿No lo recibiste? <button type="button" className="font-medium text-primary hover:underline">Reenviar</button>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); next(); }}>
          <AuthHeader title="Nueva contraseña" sub="Elige una contraseña segura para tu cuenta." />
          <div className="flex flex-col gap-4">
            <Field label="Nueva contraseña">
              <PasswordInput placeholder="••••••••" required />
            </Field>
            <Field label="Confirmar contraseña">
              <PasswordInput placeholder="••••••••" required />
            </Field>
          </div>
          <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full">
            {loading ? <Spinner /> : "Restablecer contraseña"}
          </Button>
        </form>
      )}

      {step === 3 && (
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
      )}
    </div>
  );
}
