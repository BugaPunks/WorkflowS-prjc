import { Button } from "../components/Button.tsx";
import type { Project } from "../models/project.ts";
import Modal from "./Modal.tsx";

interface DeleteProjectModalProps {
  show: boolean;
  project: Project | null;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteProjectModal({
  show,
  project,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: DeleteProjectModalProps) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="sm">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h2>
        <p class="mb-4 text-gray-600">
          ¿Estás seguro de que deseas eliminar el proyecto "{project?.name}"? Esta acción no se
          puede deshacer.
        </p>

        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div class="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            onClick={onClose}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded border border-gray-400"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            class={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
