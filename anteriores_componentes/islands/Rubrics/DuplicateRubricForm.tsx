import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Rubric } from "../../models/rubric.ts";

interface DuplicateRubricFormProps {
  rubric: Rubric;
  projectId?: string;
  onDuplicate: (newRubric: Rubric) => void;
  onCancel: () => void;
}

export default function DuplicateRubricForm({
  rubric,
  projectId,
  onDuplicate,
  onCancel,
}: DuplicateRubricFormProps) {
  const [name, setName] = useState(`Copia de ${rubric.name}`);
  const [isTemplate, setIsTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rubrics/${rubric.id}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          projectId,
          isTemplate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al duplicar la rúbrica: ${response.statusText}`);
      }

      const newRubric = await response.json();
      onDuplicate(newRubric);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al duplicar la rúbrica";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Duplicar Rúbrica</h2>

      <p class="text-gray-600 mb-6">
        Estás a punto de crear una copia de la rúbrica "{rubric.name}". La nueva rúbrica contendrá
        los mismos criterios y niveles de desempeño.
      </p>

      <form onSubmit={handleSubmit}>
        {error && <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div class="space-y-4 mb-6">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre de la nueva rúbrica{<span class="text-red-500 ml-1">*</span>}
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e: Event) => setName((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              id="isTemplate"
              name="isTemplate"
              checked={isTemplate}
              onChange={(e) => setIsTemplate((e.target as HTMLInputElement).checked)}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isTemplate" class="ml-2 block text-sm text-gray-900">
              Usar como plantilla
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-6">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} class="ml-2">
            {loading ? "Duplicando..." : "Duplicar Rúbrica"}
          </Button>
        </div>
      </form>
    </div>
  );
}
