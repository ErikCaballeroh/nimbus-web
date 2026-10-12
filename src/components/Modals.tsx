'use client';

import { useMemo, useState } from "react";
import { Icon } from "./icons";
import {
  Avatar,
  Button,
  Field,
  Input,
  Modal,
  PriorityBadge,
  Select,
  Spinner,
  StatusPill,
  Tag,
  Textarea,
} from "./ui";
import { useStore } from "../store";
import {
  fmtDate,
  priorityMeta,
  relTime,
  statusMeta,
  statusOrder,
  type Priority,
  type Project,
  type Role,
  type Status,
  type Task,
} from "../lib/data";

const palette = ["#4f46e5", "#0891b2", "#db2777", "#16a34a", "#ea580c", "#7c3aed"];

/* ---------- Project create / edit ---------- */
export function ProjectModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project;
}) {
  const { addProject, updateProject } = useStore();
  const [name, setName] = useState(project?.name ?? "");
  const [desc, setDesc] = useState(project?.description ?? "");
  const [start, setStart] = useState(project?.start ?? "2026-09-01");
  const [end, setEnd] = useState(project?.end ?? "2026-12-01");
  const [color, setColor] = useState(project?.color ?? palette[0]);
  const [err, setErr] = useState("");

  const save = () => {
    if (name.trim().length < 3) return setErr("El nombre debe tener al menos 3 caracteres");
    if (project) updateProject(project.id, { name, description: desc, start, end, color });
    else addProject({ name, description: desc, start, end, color, memberIds: ["u1"] });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? "Editar proyecto" : "Crear proyecto"}
      subtitle={project ? "Actualiza los detalles del proyecto." : "Organiza el trabajo de tu equipo en un nuevo proyecto."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>{project ? "Guardar cambios" : "Crear proyecto"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nombre del proyecto" error={err}>
          <Input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="Sitio Web Corporativo" error={!!err} />
        </Field>
        <Field label="Descripción">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="¿Cuál es el objetivo de este proyecto?" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha de inicio"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="Fecha de entrega"><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
        </div>
        <Field label="Color">
          <div className="flex gap-2">
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-lg transition-transform active:scale-90 ${color === c ? "ring-2 ring-offset-2 ring-offset-card" : ""}`}
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

/* ---------- Task create ---------- */
export function TaskModal({
  open,
  onClose,
  projectId,
  initialStatus = "todo",
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  initialStatus?: Status;
}) {
  const { addTask, members, projects } = useStore();
  const project = projects.find((p) => p.id === projectId)!;
  const projMembers = members.filter((m) => project.memberIds.includes(m.id));
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [assignee, setAssignee] = useState<string>(projMembers[0]?.id ?? "");
  const [due, setDue] = useState("2026-09-20");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const save = () => {
    if (title.trim().length < 3) return setErr("El título es obligatorio");
    setSaving(true);
    setTimeout(() => {
      addTask({ title, description: desc, priority, status, assigneeId: assignee || null, due, projectId, tags: [] });
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear tarea"
      subtitle={`En ${project.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? <Spinner /> : "Crear tarea"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Título" error={err}>
          <Input value={title} onChange={(e) => { setTitle(e.target.value); setErr(""); }} placeholder="Implementar autenticación" error={!!err} />
        </Field>
        <Field label="Descripción">
          <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detalles, criterios de aceptación…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prioridad">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {(Object.keys(priorityMeta) as Priority[]).map((p) => (
                <option key={p} value={p}>{priorityMeta[p].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {statusOrder.map((s) => (
                <option key={s} value={s}>{statusMeta[s].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Asignado a">
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Sin asignar</option>
              {projMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha límite"><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Task detail ---------- */
export function TaskDetailModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { members, updateTask, addComment, moveTask } = useStore();
  const [comment, setComment] = useState("");
  if (!task) return null;
  const assignee = members.find((m) => m.id === task.assigneeId);

  return (
    <Modal open={!!task} onClose={onClose} title={task.title} subtitle={task.code} size="lg">
      <div className="grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-5">
          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-muted-foreground">Descripción</h4>
            <p className="text-sm leading-relaxed text-foreground">
              {task.description || "Sin descripción. Añade contexto para tu equipo."}
            </p>
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          )}

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
              <Icon.message width={15} height={15} /> Comentarios ({task.comments.length})
            </h4>
            <div className="flex flex-col gap-4">
              {task.comments.map((c) => {
                const a = members.find((m) => m.id === c.authorId)!;
                return (
                  <div key={c.id} className="flex gap-3">
                    <Avatar member={a} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] font-medium text-foreground">{a.name}</span>
                        <span className="text-xs text-muted-foreground">{relTime(c.time)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-foreground">{c.text}</p>
                    </div>
                  </div>
                );
              })}
              {task.comments.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comment.trim()) { addComment(task.id, comment.trim()); setComment(""); }
                }}
                placeholder="Escribe un comentario…"
              />
              <Button
                onClick={() => { if (comment.trim()) { addComment(task.id, comment.trim()); setComment(""); } }}
                disabled={!comment.trim()}
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>

        {/* meta sidebar */}
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/40 p-4">
          <MetaRow label="Estado">
            <Select value={task.status} onChange={(e) => moveTask(task.id, e.target.value as Status)}>
              {statusOrder.map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
            </Select>
          </MetaRow>
          <MetaRow label="Prioridad">
            <Select value={task.priority} onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}>
              {(Object.keys(priorityMeta) as Priority[]).map((p) => <option key={p} value={p}>{priorityMeta[p].label}</option>)}
            </Select>
          </MetaRow>
          <MetaRow label="Asignado a">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar member={assignee} size={26} />
                <span className="text-[13px] text-foreground">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-[13px] text-muted-foreground">Sin asignar</span>
            )}
          </MetaRow>
          <MetaRow label="Fecha límite">
            <div className="flex items-center gap-1.5 text-[13px] text-foreground">
              <Icon.calendar width={15} height={15} className="text-muted-foreground" /> {fmtDate(task.due)}
            </div>
          </MetaRow>
        </div>
      </div>
    </Modal>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

/* ---------- Add member ---------- */
const directory = [
  { name: "Diego Torres", email: "diego.torres@nimbus.io", color: "#0d9488" },
  { name: "Marta Sánchez", email: "marta.sanchez@nimbus.io", color: "#9333ea" },
  { name: "Pablo Navarro", email: "pablo.navarro@nimbus.io", color: "#e11d48" },
  { name: "Elena Castro", email: "elena.castro@nimbus.io", color: "#2563eb" },
];

export function AddMemberModal({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const { addMember } = useStore();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<(typeof directory)[0] | null>(null);
  const [role, setRole] = useState<Role>("Editor");
  const results = useMemo(
    () => directory.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.email.includes(q.toLowerCase())),
    [q]
  );

  const invite = () => {
    if (!sel) return;
    addMember({ name: sel.name, email: sel.email, role, color: sel.color }, projectId);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Añadir miembro"
      subtitle="Busca personas de tu organización para invitarlas."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={invite} disabled={!sel}>Enviar invitación</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Icon.search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo…" className="pl-9" />
        </div>
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {results.map((d) => (
            <button
              key={d.email}
              onClick={() => setSel(d)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${sel?.email === d.email ? "border-primary bg-accent" : "border-transparent hover:bg-secondary"
                }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: d.color }}>
                {d.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-foreground">{d.name}</div>
                <div className="truncate text-xs text-muted-foreground">{d.email}</div>
              </div>
              {sel?.email === d.email && <Icon.check width={18} height={18} className="text-primary" />}
            </button>
          ))}
          {results.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No se encontraron resultados.</p>}
        </div>
        {sel && (
          <Field label="Rol">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {["Administrador", "Editor", "Lector"].map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
        )}
      </div>
    </Modal>
  );
}

/* ---------- Export ---------- */
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

/* ---------- Import ---------- */
export function ImportModal({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const { importTasks } = useStore();
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
    importTasks(projectId, valid.map((v) => ({ title: v.title, priority: v.priority, status: v.status })));
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
