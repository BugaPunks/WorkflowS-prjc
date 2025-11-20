import { useCallback } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";

interface TaskListViewProps {
  tasks: Task[];
  projects: Record<string, Project>;
  userStories: Record<string, UserStory>;
}

export default function TaskListView({ tasks, projects, userStories }: TaskListViewProps) {
  // Función para obtener el nombre del proyecto de una tarea
  const getProjectName = useCallback(
    (task: Task): string => {
      const userStory = userStories[task.userStoryId];
      if (!userStory) return "Proyecto desconocido";

      const project = projects[userStory.projectId];
      return project ? project.name : "Proyecto desconocido";
    },
    [userStories, projects]
  );

  // Función para obtener el título de la historia de usuario
  const getUserStoryTitle = useCallback(
    (task: Task): string => {
      const userStory = userStories[task.userStoryId];
      return userStory ? userStory.title : "Historia desconocida";
    },
    [userStories]
  );

  // Función para obtener el color según el estado
  const getStatusColor = useCallback((status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800";
      case TaskStatus.BLOCKED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Función para obtener el texto del estado
  const getStatusText = useCallback((status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return "Por hacer";
      case TaskStatus.IN_PROGRESS:
        return "En progreso";
      case TaskStatus.REVIEW:
        return "En revisión";
      case TaskStatus.DONE:
        return "Completada";
      case TaskStatus.BLOCKED:
        return "Bloqueada";
      default:
        return status;
    }
  }, []);

  // Función para obtener la prioridad de una tarea (simulada por ahora)
  const getTaskPriority = useCallback((task: Task): string => {
    // Simulamos la prioridad basándonos en el ID de la tarea
    // En una implementación real, esto vendría del modelo de tarea
    const hash = task.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const priorities = ["Baja", "Media", "Alta", "Crítica"];
    return priorities[hash % priorities.length];
  }, []);

  // Función para obtener el color de la prioridad
  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case "Crítica":
        return "bg-red-100 text-red-800";
      case "Alta":
        return "bg-orange-100 text-orange-800";
      case "Media":
        return "bg-yellow-100 text-yellow-800";
      case "Baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Función para obtener la fecha límite de una tarea (simulada por ahora)
  const getTaskDueDate = useCallback((task: Task): string => {
    // Simulamos la fecha límite basándonos en el ID de la tarea
    // En una implementación real, esto vendría del modelo de tarea
    const hash = task.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const now = new Date();
    const daysToAdd = hash % 14; // 0-13 días

    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + daysToAdd);

    // Si la tarea está completada, no mostrar fecha límite
    if (task.status === TaskStatus.DONE) {
      return "Completada";
    }

    return dueDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Si no hay tareas
  if (tasks.length === 0) {
    return (
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p class="text-gray-600">No se encontraron tareas.</p>
      </div>
    );
  }

  return (
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tarea
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Proyecto / Historia
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Prioridad
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha límite
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`/tasks/${task.id}`}
                    class="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {task.title}
                  </a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{getProjectName(task)}</div>
                  <div class="text-xs text-gray-500">{getUserStoryTitle(task)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {getStatusText(task.status)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      getTaskPriority(task)
                    )}`}
                  >
                    {getTaskPriority(task) === "Crítica" && "🔥 "}
                    {getTaskPriority(task)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.status !== TaskStatus.DONE ? (
                    <div class="flex items-center">
                      <span class="mr-1">📅</span>
                      {getTaskDueDate(task)}
                    </div>
                  ) : (
                    "Completada"
                  )}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.estimatedHours !== undefined
                    ? task.status === TaskStatus.DONE
                      ? `${task.spentHours || 0}h dedicadas`
                      : `${task.spentHours || 0}h / ${task.estimatedHours}h`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
