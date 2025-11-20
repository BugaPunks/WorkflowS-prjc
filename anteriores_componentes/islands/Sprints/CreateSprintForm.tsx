import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { SprintStatus } from "../../models/sprint.ts";
import { createSprint } from "../../services/sprintService.ts";

interface CreateSprintFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateSprintForm({
  projectId,
  onSuccess,
  onCancel,
}: CreateSprintFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    status: SprintStatus.PLANNED,
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar cambios en el formulario
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  // Enviar formulario
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar datos
      if (!formData.name.trim()) {
        throw new Error("El nombre del sprint es obligatorio");
      }

      // Convertir fechas a timestamps
      const startDate = formData.startDate ? new Date(formData.startDate).getTime() : undefined;
      const endDate = formData.endDate ? new Date(formData.endDate).getTime() : undefined;

      // Validar que la fecha de fin sea posterior a la de inicio
      if (startDate && endDate && endDate <= startDate) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }

      // Crear sprint
      await createSprint({
        name: formData.name,
        goal: formData.goal || undefined,
        projectId,
        status: formData.status,
        startDate,
        endDate,
        createdBy: "", // Se asignará en el servidor
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el sprint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4 p-4">
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Nombre del Sprint *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="goal">
          Objetivo del Sprint
        </label>
        <textarea
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          rows={3}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
          Estado
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={SprintStatus.PLANNED}>Planificado</option>
          <option value={SprintStatus.ACTIVE}>Activo</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
            Fecha de inicio
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
            Fecha de fin
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          class="bg-gray-300 hover:bg-gray-400 text-gray-800"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando..." : "Crear Sprint"}
        </Button>
      </div>
    </form>
  );
}
