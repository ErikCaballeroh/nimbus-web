'use client';

import { useState } from "react";
import { Button, Field, Icon, Modal, Spinner } from "@/components/ui";
import { ApiClientError } from "@/lib/apiClient";

export function ExportModal({
  open,
  onClose,
  count,
  projectId,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  projectId: string;
}) {
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [phase, setPhase] = useState<"config" | "loading" | "done" | "error">("config");
  const [error, setError] = useState("");

  const run = async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/export?format=${format}`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new ApiClientError(json?.error?.code ?? "INTERNAL", json?.error?.message ?? "Ha ocurrido un error inesperado.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tareas-nimbus.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setPhase("done");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
      setPhase("error");
    }
  };
  const close = () => { setPhase("config"); setError(""); onClose(); };

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
      ) : phase === "error" ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/12 text-danger">
            <Icon.alert width={30} height={30} />
          </div>
          <p className="text-sm text-foreground">{error}</p>
        </div>
      ) : (
        <Field label="Formato de archivo">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: "xlsx" as const, label: "Excel", ext: ".xlsx" },
              { id: "csv" as const, label: "CSV", ext: ".csv" },
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
      )}
    </Modal>
  );
}
