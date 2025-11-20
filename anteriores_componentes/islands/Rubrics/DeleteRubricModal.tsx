import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Rubric } from "../../models/rubric.ts";
import Modal from "../Modal.tsx";

interface DeleteRubricModalProps {
  rubric: Rubric;
  onDelete: () => void;
  onCancel: () => void;
}

export default function DeleteRubricModal({ rubric, onDelete, onCancel }: DeleteRubricModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rubrics/${rubric.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al eliminar la rúbrica: ${response.statusText}`);
      }

      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la rúbrica");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onClose={onCancel}>
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Eliminar Rúbrica</h3>

        <p class="text-gray-700 mb-4">
          ¿Estás seguro de que deseas eliminar la rúbrica <strong>"{rubric.name}"</strong>?
        </p>

        <p class="text-gray-700 mb-6">
          Esta acción no se puede deshacer y eliminará permanentemente la rúbrica y todos sus
          criterios.
        </p>

        {error && <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div class="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar Rúbrica"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
