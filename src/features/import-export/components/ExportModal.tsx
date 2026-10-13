'use client';

import { useState } from "react";
import { Button, Field, Icon, Modal, Spinner } from "@/components/ui";

export function ExportModal({ open, onClose, count }: { open: boolean; onClose: () => void; count: number }) {
  const [format, setFormat] = useState("xlsx");
  const [phase, setPhase] = useState<"config" | "loading" | "done">("config");
  const fields = ["Título", "Estado", "Prioridad", "Asignado", "Fecha límite", "Comentarios"];
  const [checked, setChecked] = useState<string[]>(fields.slice(0, 5));

  const run = () => {
    setPhase("loading");
    setTimeout(() => setPhase("done"), 1200);
  };
  const close = () => { setPhase("config"); onClose(); };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Exportar tareas"
      subtitle={`${count} tareas listas para exportar`}
      footer={
        phase === "done" ? (
          <Button onClick={close}>Listo</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>Cancelar</Button>
            <Button onClick={run} disabled={phase === "loading"}>
              {phase === "loading" ? <Spinner /> : <><Icon.download width={16} height={16} /> Exportar</>}
            </Button>
          </>
        )
      }
    >
      {phase === "done" ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/12 text-success">
            <Icon.check_circle width={30} height={30} />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">Archivo generado</h3>
          <p className="mt-1 text-sm text-muted-foreground">tareas-nimbus.{format} ({count} filas) se ha descargado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <Field label="Formato de archivo">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "xlsx", label: "Excel", ext: ".xlsx" },
                { id: "csv", label: "CSV", ext: ".csv" },
                { id: "pdf", label: "PDF", ext: ".pdf" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-4 transition-all active:scale-[0.97] ${format === f.id ? "border-primary bg-accent" : "border-border-strong hover:bg-secondary"
                    }`}
                >
                  <Icon.file width={22} height={22} className={format === f.id ? "text-primary" : "text-muted-foreground"} />
                  <span className="text-[13px] font-medium text-foreground">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.ext}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Columnas a incluir">
            <div className="grid grid-cols-2 gap-2">
              {fields.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-secondary">
                  <input
                    type="checkbox"
                    checked={checked.includes(f)}
                    onChange={(e) => setChecked((c) => e.target.checked ? [...c, f] : c.filter((x) => x !== f))}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  {f}
                </label>
              ))}
            </div>
          </Field>
        </div>
      )}
    </Modal>
  );
}
