'use client';

import { useRef, useState } from "react";
import { Button, Icon, Modal, Spinner } from "@/components/ui";
import { apiFetch, ApiClientError } from "@/lib/apiClient";
import { PriorityBadge } from "@/features/tasks/components/PriorityBadge";
import { StatusPill } from "@/features/tasks/components/StatusPill";
import type { Priority, Status } from "@/features/tasks/types";

interface RowResult {
  row: number;
  valid: boolean;
  data?: { title: string; priority?: Priority; status?: Status };
  errors?: string[];
}

interface PreviewResponse {
  rows: RowResult[];
  validCount: number;
  invalidCount: number;
}

interface ImportResponse {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

type Phase = "drop" | "previewing" | "preview" | "importing" | "done" | "error";

export function ImportModal({
  open,
  onClose,
  projectId,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onImported: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("drop");
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const runPreview = async (picked: File) => {
    setFile(picked);
    setPhase("previewing");
    try {
      const formData = new FormData();
      formData.append("file", picked);
      const response = await apiFetch<PreviewResponse>(`/api/projects/${projectId}/tasks/import/preview`, {
        method: "POST",
        body: formData,
      });
      setPreview(response);
      setPhase("preview");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
      setPhase("error");
    }
  };

  const confirm = async () => {
    if (!file) return;
    setPhase("importing");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiFetch<ImportResponse>(`/api/projects/${projectId}/tasks/import`, {
        method: "POST",
        body: formData,
      });
      setResult(response);
      setPhase("done");
      onImported();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("drop");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };
  const close = () => { reset(); onClose(); };

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
            <Button variant="secondary" onClick={reset}>Atrás</Button>
            <Button onClick={confirm} disabled={!preview || preview.validCount === 0}>
              Importar {preview?.validCount ?? 0} tareas
            </Button>
          </>
        ) : phase === "done" ? (
          <Button onClick={close}>Listo</Button>
        ) : phase === "error" ? (
          <>
            <Button variant="secondary" onClick={reset}>Atrás</Button>
            <Button variant="secondary" onClick={close}>Cerrar</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={close}>Cancelar</Button>
        )
      }
    >
      {phase === "drop" && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const dropped = e.dataTransfer.files[0];
              if (dropped) runPreview(dropped);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center transition-colors ${drag ? "border-primary bg-accent" : "border-border-strong hover:border-primary hover:bg-secondary/50"
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) runPreview(picked);
              }}
            />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon.upload width={26} height={26} />
            </div>
            <p className="text-sm font-medium text-foreground">Arrastra tu archivo aquí o haz clic para explorar</p>
            <p className="mt-1 text-xs text-muted-foreground">Formatos soportados: .xlsx, .csv · Máx 5 MB</p>
          </div>
          <a
            href="/templates/plantilla-tareas.xlsx"
            download
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Icon.download width={14} height={14} /> Descargar plantilla
          </a>
        </div>
      )}

      {phase === "previewing" && (
        <div className="flex flex-col items-center py-16">
          <Spinner />
          <p className="mt-3 text-sm text-muted-foreground">Validando archivo…</p>
        </div>
      )}

      {phase === "preview" && preview && (
        <div>
          <div className="mb-3 flex items-center gap-4 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[13px]">
            <span className="flex items-center gap-1.5 text-success"><Icon.check_circle width={15} height={15} /> {preview.validCount} válidas</span>
            <span className="flex items-center gap-1.5 text-danger"><Icon.alert width={15} height={15} /> {preview.invalidCount} con errores</span>
            <span className="ml-auto flex items-center gap-1.5 text-muted-foreground"><Icon.file width={15} height={15} /> {file?.name}</span>
          </div>
          <div className="max-h-96 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Fila</th>
                  <th className="px-4 py-2.5 font-medium">Título</th>
                  <th className="px-4 py-2.5 font-medium">Prioridad</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                  <th className="px-4 py-2.5 font-medium">Validación</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.row} className={`border-t border-border ${!r.valid ? "bg-danger/5" : ""}`}>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.row}</td>
                    <td className="px-4 py-2.5 text-foreground">{r.data?.title || <span className="text-danger">(vacío)</span>}</td>
                    <td className="px-4 py-2.5">{r.data?.priority && <PriorityBadge priority={r.data.priority} />}</td>
                    <td className="px-4 py-2.5">{r.data?.status && <StatusPill status={r.data.status} />}</td>
                    <td className="px-4 py-2.5">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success"><Icon.check width={14} height={14} /> OK</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-danger">
                          <Icon.alert width={14} height={14} /> {(r.errors ?? []).join(" ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {phase === "importing" && (
        <div className="flex flex-col items-center py-16">
          <Spinner />
          <p className="mt-3 text-sm text-muted-foreground">Importando tareas…</p>
        </div>
      )}

      {phase === "done" && result && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/12 text-success">
            <Icon.check_circle width={30} height={30} />
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">Importación completada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.imported} tareas nuevas se añadieron al proyecto
            {result.skipped > 0 ? `, ${result.skipped} omitidas` : ""}.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-3 w-full max-w-sm space-y-1 text-left text-xs text-danger">
              {result.errors.map((e) => (
                <li key={e.row}>Fila {e.row}: {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/12 text-danger">
            <Icon.alert width={30} height={30} />
          </div>
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}
    </Modal>
  );
}
