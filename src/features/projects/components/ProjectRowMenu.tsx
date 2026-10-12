import { useRouter } from "next/navigation";
import { Icon } from "../../../components/ui";

function MenuItem({ icon: I, children, onClick, danger }: { icon: typeof Icon.user; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${danger ? "text-danger hover:bg-danger/8" : "text-foreground hover:bg-secondary"}`}>
      <I width={15} height={15} className={danger ? "" : "text-muted-foreground"} /> {children}
    </button>
  );
}

export function ProjectRowMenu({
  projectId,
  onEdit,
  onClose,
}: {
  projectId: string;
  onEdit: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <div className="animate-dropdown absolute right-0 top-10 z-40 w-44 rounded-lg border border-border bg-popover py-1 shadow-[var(--shadow-lg)]">
      <MenuItem icon={Icon.board} onClick={() => { onClose(); router.push(`/projects/${projectId}/board`); }}>Abrir tablero</MenuItem>
      <MenuItem icon={Icon.team} onClick={() => { onClose(); router.push(`/projects/${projectId}/members`); }}>Miembros</MenuItem>
      <MenuItem icon={Icon.edit} onClick={() => { onEdit(); onClose(); }}>Editar</MenuItem>
      <div className="my-1 border-t border-border" />
      <MenuItem icon={Icon.trash} danger onClick={onClose}>Eliminar</MenuItem>
    </div>
  );
}
