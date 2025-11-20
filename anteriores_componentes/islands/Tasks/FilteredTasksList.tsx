import { useCallback, useMemo } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";
import TaskCalendarView from "./TaskCalendarView.tsx";
import type { TaskFiltersState } from "./TaskFilters.tsx";
import type { GroupingOption } from "./TaskGrouping.tsx";
import TaskListView from "./TaskListView.tsx";
import type { ViewType } from "./TaskViewSelector.tsx";

interface FilteredTasksListProps {
  tasks: Task[];
  projects: Record<string, Project>;
  userStories: Record<string, UserStory>;
  filters: TaskFiltersState;
  grouping: GroupingOption;
  view: ViewType;
}

export default function FilteredTasksList({
  tasks,
  projects,
  userStories,
  filters,
  grouping,
  view,
}: FilteredTasksListProps) {
  // Aplicar filtros a las tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtrar por estado
      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }

      // Filtrar por proyecto
      if (filters.projectId) {
        const userStory = userStories[task.userStoryId];
        if (!userStory || userStory.projectId !== filters.projectId) {
          return false;
        }
      }

      // Filtrar por sprint (pendiente de implementar)
      // Esto requeriría conocer a qué sprint pertenece cada historia de usuario

      // Filtrar por término de búsqueda
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower) || false;

        if (!titleMatch && !descMatch) {
          return false;
        }
      }

      // Filtrar por prioridad (pendiente de implementar)
      // Esto requeriría añadir un campo de prioridad al modelo de tarea

      return true;
    });
  }, [tasks, filters, userStories]);

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

  // Agrupar tareas según la opción seleccionada
  const groupedTasks = useMemo(() => {
    if (grouping === "none") {
      return { "Todas las tareas": filteredTasks };
    }

    const groups: Record<string, Task[]> = {};

    for (const task of filteredTasks) {
      let groupKey = "";

      if (grouping === "status") {
        groupKey = task.status;
      } else if (grouping === "project") {
        const userStory = userStories[task.userStoryId];
        if (userStory) {
          groupKey = userStory.projectId;
        } else {
          groupKey = "unknown";
        }
      } else if (grouping === "userStory") {
        groupKey = task.userStoryId;
      } else if (grouping === "priority") {
        groupKey = getTaskPriority(task);
      } else if (grouping === "dueDate") {
        // Agrupar por semana
        const dueDate = getTaskDueDate(task);
        if (task.status === TaskStatus.DONE) {
          groupKey = "Completadas";
        } else {
          const now = new Date();
          const taskDate = new Date(dueDate);

          // Calcular la diferencia en días
          const diffTime = taskDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            groupKey = "Vencidas";
          } else if (diffDays === 0) {
            groupKey = "Hoy";
          } else if (diffDays === 1) {
            groupKey = "Mañana";
          } else if (diffDays < 7) {
            groupKey = "Esta semana";
          } else if (diffDays < 14) {
            groupKey = "Próxima semana";
          } else {
            groupKey = "Más adelante";
          }
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    }

    // Convertir a un objeto con nombres legibles
    const namedGroups: Record<string, Task[]> = {};

    for (const [key, tasks] of Object.entries(groups)) {
      let groupName = key;

      if (grouping === "status") {
        groupName = getStatusText(key as TaskStatus);
      } else if (grouping === "project") {
        groupName = projects[key]?.name || "Proyecto desconocido";
      } else if (grouping === "userStory") {
        groupName = userStories[key]?.title || "Historia desconocida";
      }
      // Para prioridad y fecha límite, el nombre del grupo ya es legible

      namedGroups[groupName] = tasks;
    }

    // Ordenar los grupos según la lógica apropiada
    const orderedGroups: Record<string, Task[]> = {};

    if (grouping === "priority") {
      // Orden de prioridad: Crítica, Alta, Media, Baja
      const priorityOrder = ["Crítica", "Alta", "Media", "Baja"];
      for (const priority of priorityOrder) {
        if (namedGroups[priority]) {
          orderedGroups[priority] = namedGroups[priority];
        }
      }
      return orderedGroups;
    }

    if (grouping === "dueDate") {
      // Orden de fechas: Vencidas, Hoy, Mañana, Esta semana, Próxima semana, Más adelante, Completadas
      const dateOrder = [
        "Vencidas",
        "Hoy",
        "Mañana",
        "Esta semana",
        "Próxima semana",
        "Más adelante",
        "Completadas",
      ];
      for (const date of dateOrder) {
        if (namedGroups[date]) {
          orderedGroups[date] = namedGroups[date];
        }
      }
      return orderedGroups;
    }

    return namedGroups;
  }, [
    filteredTasks,
    grouping,
    projects,
    userStories,
    getStatusText,
    getTaskPriority,
    getTaskDueDate,
  ]);

  // Si no hay tareas después de aplicar los filtros
  if (filteredTasks.length === 0) {
    return (
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p class="text-gray-600">No se encontraron tareas con los filtros aplicados.</p>
      </div>
    );
  }

  // Vista de calendario
  if (view === "calendar") {
    return <TaskCalendarView tasks={filteredTasks} projects={projects} userStories={userStories} />;
  }

  // Vista de lista
  if (view === "list") {
    return <TaskListView tasks={filteredTasks} projects={projects} userStories={userStories} />;
  }

  return (
    <div class="space-y-8">
      {Object.entries(groupedTasks).map(([groupName, tasks]) => (
        <div key={groupName} class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800">
              {groupName} <span class="text-gray-500 text-sm">({tasks.length})</span>
            </h3>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div key={task.id} class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div class="flex justify-between items-start mb-2">
                    <div class="text-xs text-gray-500">
                      {getProjectName(task)} / {getUserStoryTitle(task)}
                    </div>
                    <div class="flex items-center space-x-1">
                      {/* Dropdown menu (simulado con prioridad) */}
                      <span
                        class={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          getTaskPriority(task) === "Crítica"
                            ? "bg-red-100 text-red-800"
                            : getTaskPriority(task) === "Alta"
                              ? "bg-orange-100 text-orange-800"
                              : getTaskPriority(task) === "Media"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {getTaskPriority(task) === "Crítica" && "🔥 "}
                        {getTaskPriority(task)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/tasks/${task.id}`}
                    class="text-md font-semibold text-gray-800 hover:text-blue-600 block mb-3"
                  >
                    {task.title}
                  </a>

                  {/* Información de horas */}
                  {task.estimatedHours !== undefined && (
                    <div class="mb-3 text-xs text-gray-500">
                      {task.status === TaskStatus.DONE
                        ? `${task.spentHours || 0}h dedicadas`
                        : `${task.spentHours || 0}h / ${task.estimatedHours}h`}
                    </div>
                  )}

                  {/* Fecha límite */}
                  {task.status !== TaskStatus.DONE && (
                    <div class="mb-3 text-xs text-gray-600 flex items-center">
                      <span class="mr-1">📅</span>
                      {getTaskDueDate(task)}
                    </div>
                  )}

                  {/* Estado en la parte inferior */}
                  <div class="flex justify-between items-center mt-auto">
                    <span
                      class={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
