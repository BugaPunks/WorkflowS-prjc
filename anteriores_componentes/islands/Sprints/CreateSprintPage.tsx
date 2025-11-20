import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";
import { SprintStatus } from "../../models/sprint.ts";
import { createSprint } from "../../services/sprintService.ts";
import { useSession } from "../../hooks/useSession.ts";

interface CreateSprintPageProps {
  projects: Project[];
}

export default function CreateSprintPage({ projects }: CreateSprintPageProps) {
  const { session } = useSession();
  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    goal: "",
    status: SprintStatus.PLANNED,
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);

    try {
      // Validar datos
      if (!formData.projectId) {
        throw new Error("Debes seleccionar un proyecto");
      }

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
      const response = await createSprint({
        name: formData.name,
        goal: formData.goal || undefined,
        projectId: formData.projectId,
        status: formData.status,
        startDate,
        endDate,
        createdBy: session!.userId,
      });

      // Mostrar mensaje de éxito
      setSuccess("Sprint creado correctamente");

      // Limpiar formulario
      setFormData({
        projectId: "",
        name: "",
        goal: "",
        status: SprintStatus.PLANNED,
        startDate: "",
        endDate: "",
      });

      // Redirigir a la página del sprint después de 2 segundos
      setTimeout(() => {
        globalThis.location.href = `/sprints/${response.id}`;
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el sprint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="bg-white shadow-md rounded-lg p-6">
      {/* Mensajes de error o éxito */}
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        {/* Selección de proyecto */}
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="projectId">
            Proyecto *
          </label>
          <select
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre del sprint */}
        <div class="mb-4">
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

        {/* Objetivo del sprint */}
        <div class="mb-4">
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

        {/* Estado */}
        <div class="mb-4">
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
            <option value={SprintStatus.ACTIVE}>En progreso</option>
            <option value={SprintStatus.COMPLETED}>Completado</option>
            <option value={SprintStatus.CANCELLED}>Cancelado</option>
          </select>
        </div>

        {/* Fechas */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Fecha de inicio */}
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

          {/* Fecha de fin */}
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

        {/* Botones */}
        <div class="flex justify-end space-x-3">
          <Button type="button" href="/sprints" class="bg-gray-200 hover:bg-gray-300 text-gray-800">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Creando..." : "Crear Sprint"}
          </Button>
        </div>
      </form>
    </div>
  );
}
