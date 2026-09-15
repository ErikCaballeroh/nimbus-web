'use client';

import { useState } from "react";
import { Button, Field, Input, PasswordInput, Spinner } from "../components/ui";
import { Icon } from "../components/icons";
import { useStore } from "../store";

export type AuthView = "login" | "register" | "recover";

function AuthShell({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useStore();
  return (
    <div className="grid min-h-full lg:grid-cols-[1fr_1.05fr]">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />
        <div className="relative flex items-center gap-2.5 text-white">
          <Icon.logo />
          <span className="text-lg font-semibold tracking-tight">Nimbus</span>
        </div>
        <div className="relative max-w-md text-white">
          <p className="text-[26px] font-semibold leading-snug tracking-tight">
            El espacio donde tu equipo planifica, prioriza y entrega — en tiempo real.
          </p>
          <p className="mt-4 text-sm text-white/70">
            Tableros Kanban, seguimiento de tareas y colaboración fluida para equipos que se mueven rápido.
          </p>
          <div className="mt-8 flex -space-x-2">
            {["#22d3ee", "#f472b6", "#a3e635", "#fbbf24"].map((c, i) => (
              <span key={i} className="h-9 w-9 rounded-full ring-2 ring-primary" style={{ background: c }} />
            ))}
            <span className="ml-4 self-center text-sm text-white/70">+2.4k equipos activos</span>
          </div>
        </div>
        <div className="relative text-xs text-white/50">© 2026 Nimbus Labs. Todos los derechos reservados.</div>
      </div>

      {/* Right form area */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <button
          onClick={toggleTheme}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Cambiar tema"
        >
          {theme === "light" ? <Icon.moon width={18} height={18} /> : <Icon.sun width={18} height={18} />}
        </button>
        <div className="w-full max-w-sm animate-rise">{children}</div>
      </div>
    </div>
  );
}

export function Auth({ onAuthed, initialView = "login" }: { onAuthed: () => void; initialView?: AuthView }) {
  const [view, setView] = useState<AuthView>(initialView);
  return (
    <AuthShell>
      {view === "login" && <Login onAuthed={onAuthed} go={setView} />}
      {view === "register" && <Register onAuthed={onAuthed} go={setView} />}
      {view === "recover" && <Recover go={setView} />}
    </AuthShell>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-7 lg:hidden-none">
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <Icon.logo />
        <span className="text-lg font-semibold">Nimbus</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

function Login({ onAuthed, go }: { onAuthed: () => void; go: (v: AuthView) => void }) {
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
    setTimeout(onAuthed, 850);
  };

  return (
    <form onSubmit={submit}>
      <Header title="Bienvenida de nuevo" sub="Inicia sesión para continuar con tus proyectos." />
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
          <button type="button" onClick={() => go("recover")} className="text-[13px] font-medium text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
          {loading ? <Spinner /> : "Iniciar sesión"}
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <button onClick={() => go("register")} className="font-medium text-primary hover:underline">
          Crear cuenta
        </button>
      </p>
    </form>
  );
}

function Register({ onAuthed, go }: { onAuthed: () => void; go: (v: AuthView) => void }) {
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
    setTimeout(onAuthed, 900);
  };

  const strength = Math.min(4, Math.floor(f.pw.length / 3));
  return (
    <form onSubmit={submit}>
      <Header title="Crea tu cuenta" sub="Empieza gratis, sin tarjeta de crédito." />
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
        <button onClick={() => go("login")} className="font-medium text-primary hover:underline">
          Iniciar sesión
        </button>
      </p>
    </form>
  );
}

function Recover({ go }: { go: (v: AuthView) => void }) {
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
      <button onClick={() => go("login")} className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
        <Icon.chevronLeft width={16} height={16} /> Volver a inicio de sesión
      </button>

      {/* progress */}
      <div className="mb-7 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={(e) => { e.preventDefault(); next(); }}>
          <Header title="Recuperar contraseña" sub="Te enviaremos un código de verificación a tu correo." />
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
          <Header title="Verifica tu correo" sub={`Introduce el código de 4 dígitos enviado a ${email || "tu correo"}.`} />
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
          <Header title="Nueva contraseña" sub="Elige una contraseña segura para tu cuenta." />
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
          <Button size="lg" className="mt-6 w-full" onClick={() => go("login")}>
            Ir a iniciar sesión
          </Button>
        </div>
      )}
    </div>
  );
}
