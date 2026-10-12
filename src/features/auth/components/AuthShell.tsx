'use client';

import type { ReactNode } from "react";
import { Icon } from "../../../components/ui";
import { useStore } from "../../../store";

export function AuthShell({ children }: { children: ReactNode }) {
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

export function AuthHeader({ title, sub }: { title: string; sub: string }) {
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
