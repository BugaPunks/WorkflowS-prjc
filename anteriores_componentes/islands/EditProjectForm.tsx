import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { type Project, ProjectStatus } from "../models/project.ts";

interface EditProjectFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditProjectForm({ project, onSuccess, onCancel }: EditProjectFormProps) {
  const [formData, setFormData] = useState({
    id: project.id,
    name: project.name,
    description: project.description || "",
    status: project.status,
    startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const value = target.name === "status" ? (target.value as ProjectStatus) : target.value;

    setFormData({
      ...formData,
      [target.name]: value,
    });

    // Limpiar error cuando se edita el campo
    if (errors[target.name]) {
      setErrors({
        ...errors,
        [target.name]: undefined,
      });
    }

    // Limpiar error general
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (!formData.name) {
      newErrors.name = "El nombre del proyecto es obligatorio";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre del proyecto debe tener al menos 3 caracteres";
    }

    // Validar fechas
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate).getTime();
      const endDate = new Date(formData.endDate).getTime();

      if (endDate < startDate) {
        newErrors.endDate = "La fecha de finalización debe ser posterior a la fecha de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir fechas a timestamps
      const startDate = formData.startDate ? new Date(formData.startDate).getTime() : undefined;
      const endDate = formData.endDate ? new Date(formData.endDate).getTime() : undefined;

      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al actualizar el proyecto");
        } catch (_e) {
          throw new Error(`Error al actualizar el proyecto: ${response.statusText}`);
        }
      }

      // Llamar a la función de éxito
      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      {submitError && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{submitError}</p>
        </div>
      )}

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Nombre del Proyecto*
        </label>
        <input
          class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.name ? "border-red-500" : ""
          }`}
          id="name"
          name="name"
          type="text"
          placeholder="Nombre del Proyecto"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p class="text-red-500 text-xs italic mt-1">{errors.name}</p>}
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Descripción
        </label>
        <textarea
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          name="description"
          placeholder="Descripción del proyecto"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
          Estado*
        </label>
        <select
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value={ProjectStatus.PLANNING}>Planificación</option>
          <option value={ProjectStatus.IN_PROGRESS}>En Progreso</option>
          <option value={ProjectStatus.ON_HOLD}>En Pausa</option>
          <option value={ProjectStatus.COMPLETED}>Completado</option>
          <option value={ProjectStatus.CANCELLED}>Cancelado</option>
        </select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
            Fecha de Inicio
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
            Fecha de Finalización
          </label>
          <input
            class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.endDate ? "border-red-500" : ""
            }`}
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
          />
          {errors.endDate && <p class="text-red-500 text-xs italic mt-1">{errors.endDate}</p>}
        </div>
      </div>

      <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-6">
        <Button
          type="button"
          onClick={onCancel}
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2 border border-gray-400"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          class={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Actualizando..." : "Actualizar Proyecto"}
        </Button>
      </div>
    </form>
  );
}
