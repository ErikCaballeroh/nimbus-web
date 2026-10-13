'use client';

import { useState } from "react";
import { Button, Icon, Modal } from "@/components/ui";
import { PriorityBadge } from "@/features/tasks/components/PriorityBadge";
import { StatusPill } from "@/features/tasks/components/StatusPill";
import type { Priority, Status } from "@/features/tasks/types";

// Preview-only for now: real parsing, validation and persistence land in
// Phase 8 (import/export). This shows the intended flow without writing
// anything, since the board's tasks are real data since Phase 6.
export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<"drop" | "preview" | "done">("drop");
  const [drag, setDrag] = useState(false);

  const sample = [
    { title: "Configurar analítica", priority: "medium" as Priority, status: "todo" as Status, valid: true },
    { title: "Migrar base de datos", priority: "high" as Priority, status: "todo" as Status, valid: true },
    { title: "Auditoría de accesibilidad", priority: "low" as Priority, status: "in_progress" as Status, valid: true },
    { title: "", priority: "medium" as Priority, status: "todo" as Status, valid: false },
    { title: "Redactar documentación", priority: "medium" as Priority, status: "review" as Status, valid: true },
  ];
  const valid = sample.filter((s) => s.valid);

  const confirm = () => {
    setPhase("done");
  };
  const close = () => { setPhase("drop"); onClose(); };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Importar desde Excel"
      subtitle="Sube un archivo .xlsx o .csv para crear tareas en lote."
      size="lg"
      footer={
        phase === "preview" ? (
          <>
            <Button variant="secondary" onClick={() => setPhase("drop")}>Atrás</Button>
            <Button onClick={confirm}>Importar {valid.length} tareas</Button>
          </>
        ) : phase === "done" ? (
          <Button onClick={close}>Listo</Button>
        ) : (
          <Button variant="secondary" onClick={close}>Cancelar</Button>
        )
      }
    >
      {phase === "drop" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setPhase("preview"); }}
          onClick={() => setPhase("preview")}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center transition-colors ${drag ? "border-primary bg-accent" : "border-border-strong hover:border-primary hover:bg-secondary/50"
            }`}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon.upload width={26} height={26} />
          </div>
          <p className="text-sm font-medium text-foreground">Arrastra tu archivo aquí o haz clic para explorar</p>
          <p className="mt-1 text-xs text-muted-foreground">Formatos soportados: .xlsx, .csv · Máx 10 MB</p>
        </div>
      )}

      {phase === "preview" && (
        <div>
          <div className="mb-3 flex items-center gap-4 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[13px]">
            <span className="flex items-center gap-1.5 text-success"><Icon.check_circle width={15} height={15} /> {valid.length} válidas</span>
            <span className="flex items-center gap-1.5 text-danger"><Icon.alert width={15} height={15} /> {sample.length - valid.length} con errores</span>
            <span className="ml-auto flex items-center gap-1.5 text-muted-foreground"><Icon.file width={15} height={15} /> tareas-importar.xlsx</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Título</th>
                  <th className="px-4 py-2.5 font-medium">Prioridad</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                  <th className="px-4 py-2.5 font-medium">Validación</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((r, i) => (
                  <tr key={i} className={`border-t border-border ${!r.valid ? "bg-danger/5" : ""}`}>
                    <td className="px-4 py-2.5 text-foreground">{r.title || <span className="text-danger">(vacío)</span>}</td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-4 py-2.5"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-2.5">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success"><Icon.check width={14} height={14} /> OK</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-danger"><Icon.alert width={14} height={14} /> Falta título</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/12 text-success">
            <Icon.check_circle width={30} height={30} />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">Importación completada</h3>
          <p className="mt-1 text-sm text-muted-foreground">{valid.length} tareas nuevas se añadieron al proyecto.</p>
        </div>
      )}
    </Modal>
  );
}
