import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import { getProjectMembers } from "../../services/projectService.ts";
import { updateTask } from "../../services/taskService.ts";
import { getUserStoryById } from "../../services/userStoryService.ts";

// Definir una interfaz extendida para los miembros del proyecto
import type { ProjectMember } from "../../models/project.ts";

interface ExtendedProjectMember extends ProjectMember {
  firstName?: string;
  lastName?: string;
}

interface EditTaskFormProps {
  task: Task;
  onSuccess: (updatedTask?: Task) => void;
  onCancel: () => void;
}

export default function EditTaskForm({ task, onSuccess, onCancel }: EditTaskFormProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    status: task.status,
    assignedTo: task.assignedTo || "",
    estimatedHours: task.estimatedHours !== undefined ? task.estimatedHours.toString() : "",
    spentHours: task.spentHours !== undefined ? task.spentHours.toString() : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<ExtendedProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [loadMembersError, setLoadMembersError] = useState<string | null>(null);

  // Cargar miembros del proyecto al montar el componente
  useEffect(() => {
    const loadProjectMembers = async () => {
      setIsLoadingMembers(true);
      setLoadMembersError(null);

      try {
        // Obtener la historia de usuario para conseguir el ID del proyecto
        const userStory = await getUserStoryById(task.userStoryId);

        if (userStory?.projectId) {
          // Obtener miembros del proyecto
          const members = await getProjectMembers(userStory.projectId);
          // Los miembros ya vienen con la información completa desde la API
          setProjectMembers(members as ExtendedProjectMember[]);
        }
      } catch (err) {
        console.error("Error cargando miembros del proyecto:", err);
        setLoadMembersError("Error al cargar los miembros del proyecto");
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadProjectMembers();
  }, [task.userStoryId]);

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
      if (!formData.title.trim()) {
        throw new Error("El título de la tarea es obligatorio");
      }

      // Convertir horas a números
      const estimatedHours = formData.estimatedHours
        ? Number.parseFloat(formData.estimatedHours)
        : undefined;
      const spentHours = formData.spentHours ? Number.parseFloat(formData.spentHours) : undefined;

      // Actualizar tarea
      const updatedTask = await updateTask(task.id, {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined,
        estimatedHours,
        spentHours,
      });

      onSuccess(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la tarea");
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
        <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
          Título de la Tarea *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
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
          <option value={TaskStatus.TODO}>Por hacer</option>
          <option value={TaskStatus.IN_PROGRESS}>En progreso</option>
          <option value={TaskStatus.REVIEW}>En revisión</option>
          <option value={TaskStatus.DONE}>Completada</option>
          <option value={TaskStatus.BLOCKED}>Bloqueada</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="assignedTo">
          Asignada a
        </label>
        {isLoadingMembers ? (
          <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
            Cargando miembros...
          </div>
        ) : loadMembersError ? (
          <div class="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
            {loadMembersError}
          </div>
        ) : (
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Sin asignar --</option>
            {projectMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.firstName && member.lastName
                  ? `${member.firstName} ${member.lastName}`
                  : member.username}{" "}
                ({member.email})
              </option>
            ))}
          </select>
        )}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="estimatedHours">
            Horas estimadas
          </label>
          <input
            type="number"
            id="estimatedHours"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            min="0"
            step="0.5"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="spentHours">
            Horas dedicadas
          </label>
          <input
            type="number"
            id="spentHours"
            name="spentHours"
            value={formData.spentHours}
            onChange={handleChange}
            min="0"
            step="0.5"
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
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
