'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "../../../components/ui";
import { apiFetch, ApiClientError } from "../../../lib/apiClient";
import type { ProjectListItem } from "../types";

export function DeleteProjectModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: ProjectListItem;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${project.id}`, { method: "DELETE" });
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ha ocurrido un error inesperado.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar proyecto"
      subtitle={`Esta acción no se puede deshacer. Se eliminará "${project.name}" junto con sus tareas y comentarios.`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={confirm} disabled={deleting}>Eliminar proyecto</Button>
        </>
      }
    >
      {error && <p className="text-sm text-danger">{error}</p>}
    </Modal>
  );
}
