import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";
import WorkloadPreferences from "./WorkloadPreferences.tsx";

interface WorkloadSummaryProps {
  tasks: Task[];
  projects?: Record<string, Project>;
  userStories?: Record<string, UserStory>;
  daysToShow?: number;
  viewMode?: "daily" | "weekly" | "byProject" | "byStatus";
}

interface DailyWorkload {
  date: Date;
  formattedDate: string;
  estimatedHours: number;
  tasks: Task[];
}

interface WeeklyWorkload {
  weekStart: Date;
  weekEnd: Date;
  formattedRange: string;
  estimatedHours: number;
  tasks: Task[];
}

interface ProjectWorkload {
  projectId: string;
  projectName: string;
  estimatedHours: number;
  tasks: Task[];
}

interface StatusWorkload {
  status: TaskStatus;
  statusName: string;
  estimatedHours: number;
  tasks: Task[];
}

export default function WorkloadSummary({
  tasks,
  projects = {},
  userStories = {},
  daysToShow = 7,
  viewMode: initialViewMode = "daily",
}: WorkloadSummaryProps) {
  // Estado para el modo de visualización
  const [viewMode, setViewMode] = useState(initialViewMode);

  // Estado para mostrar el modal de preferencias
  const [showPreferences, setShowPreferences] = useState(false);

  // Estado para las preferencias
  const [preferences, setPreferences] = useState({
    showMetrics: true,
    showExport: true,
    daysToShow: daysToShow,
  });

  // Guardar preferencia de vista en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("workloadViewMode", viewMode);
    } catch (error) {
      console.error("Error al guardar preferencia de vista:", error);
    }
  }, [viewMode]);

  // Cargar preferencia de vista desde localStorage
  useEffect(() => {
    try {
      // Cargar modo de vista
      const savedViewMode = localStorage.getItem("workloadViewMode");
      if (savedViewMode && ["daily", "weekly", "byProject", "byStatus"].includes(savedViewMode)) {
        setViewMode(savedViewMode as "daily" | "weekly" | "byProject" | "byStatus");
      }

      // Cargar preferencias
      const savedPrefs = localStorage.getItem("workloadPreferences");
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        setPreferences({
          showMetrics: parsedPrefs.showMetrics ?? true,
          showExport: parsedPrefs.showExport ?? true,
          daysToShow: parsedPrefs.daysToShow ?? daysToShow,
        });
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    }
  }, [daysToShow]);

  // Función para abrir el modal de preferencias
  const openPreferences = () => {
    setShowPreferences(true);
  };

  // Función para cerrar el modal de preferencias
  const closePreferences = () => {
    setShowPreferences(false);
  };
  // Filtrar tareas que tienen horas estimadas y no están completadas
  const activeTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.estimatedHours !== undefined && task.status !== TaskStatus.DONE
    );
  }, [tasks]);

  // Función para obtener la fecha límite de una tarea (simulada por ahora)
  const getTaskDueDate = useCallback((task: Task): Date => {
    // Simulamos la fecha límite basándonos en el ID de la tarea
    // En una implementación real, esto vendría del modelo de tarea
    const hash = task.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const now = new Date();
    const daysToAdd = hash % 14; // 0-13 días

    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + daysToAdd);

    return dueDate;
  }, []);

  // Función para obtener el nombre del estado
  const getStatusName = useCallback((status: TaskStatus): string => {
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

  // Calcular la carga de trabajo diaria
  const dailyWorkload = useMemo(() => {
    const workloadMap: Record<string, DailyWorkload> = {};
    const today = new Date();

    // Inicializar los próximos días
    for (let i = 0; i < preferences.daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];

      workloadMap[dateKey] = {
        date: new Date(date),
        formattedDate: date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        estimatedHours: 0,
        tasks: [],
      };
    }

    // Asignar tareas a sus fechas límite
    for (const task of activeTasks) {
      const dueDate = getTaskDueDate(task);
      const dateKey = dueDate.toISOString().split("T")[0];

      // Solo considerar fechas dentro del rango de días a mostrar
      if (workloadMap[dateKey]) {
        workloadMap[dateKey].estimatedHours += task.estimatedHours || 0;
        workloadMap[dateKey].tasks.push(task);
      }
    }

    // Convertir a array y ordenar por fecha
    return Object.values(workloadMap).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activeTasks, preferences.daysToShow, getTaskDueDate]);

  // Calcular la carga de trabajo semanal
  const weeklyWorkload = useMemo(() => {
    const workloadMap: Record<string, WeeklyWorkload> = {};
    const today = new Date();

    // Ajustar al lunes de la semana actual
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Inicializar las próximas semanas
    for (let i = 0; i < Math.ceil(preferences.daysToShow / 7); i++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() + i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekKey = weekStart.toISOString().split("T")[0];

      workloadMap[weekKey] = {
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        formattedRange: `${weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`,
        estimatedHours: 0,
        tasks: [],
      };
    }

    // Asignar tareas a sus semanas
    for (const task of activeTasks) {
      const dueDate = getTaskDueDate(task);

      // Encontrar la semana a la que pertenece la fecha
      for (const [weekKey, week] of Object.entries(workloadMap)) {
        if (dueDate >= week.weekStart && dueDate <= week.weekEnd) {
          workloadMap[weekKey].estimatedHours += task.estimatedHours || 0;
          workloadMap[weekKey].tasks.push(task);
          break;
        }
      }
    }

    // Convertir a array y ordenar por fecha
    return Object.values(workloadMap).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }, [activeTasks, preferences.daysToShow, getTaskDueDate]);

  // Calcular la carga de trabajo por proyecto
  const projectWorkload = useMemo(() => {
    const workloadMap: Record<string, ProjectWorkload> = {};

    // Asignar tareas a sus proyectos
    for (const task of activeTasks) {
      const userStory = userStories[task.userStoryId];
      if (!userStory) continue;

      const projectId = userStory.projectId;
      const project = projects[projectId];

      if (!workloadMap[projectId]) {
        workloadMap[projectId] = {
          projectId,
          projectName: project ? project.name : "Proyecto desconocido",
          estimatedHours: 0,
          tasks: [],
        };
      }

      workloadMap[projectId].estimatedHours += task.estimatedHours || 0;
      workloadMap[projectId].tasks.push(task);
    }

    // Convertir a array y ordenar por horas estimadas (descendente)
    return Object.values(workloadMap).sort((a, b) => b.estimatedHours - a.estimatedHours);
  }, [activeTasks, projects, userStories]);

  // Calcular la carga de trabajo por estado
  const statusWorkload = useMemo(() => {
    const workloadMap: Record<string, StatusWorkload> = {};

    // Inicializar todos los estados posibles
    const allStatuses = [
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.REVIEW,
      TaskStatus.BLOCKED,
    ];
    for (const status of allStatuses) {
      workloadMap[status] = {
        status,
        statusName: getStatusName(status),
        estimatedHours: 0,
        tasks: [],
      };
    }

    // Asignar tareas a sus estados
    for (const task of activeTasks) {
      if (workloadMap[task.status]) {
        workloadMap[task.status].estimatedHours += task.estimatedHours || 0;
        workloadMap[task.status].tasks.push(task);
      }
    }

    // Convertir a array y mantener el orden de los estados
    return allStatuses.map((status) => workloadMap[status]).filter((item) => item.tasks.length > 0);
  }, [activeTasks, getStatusName]);

  // Calcular el máximo de horas para escalar el gráfico
  const maxHours = useMemo(() => {
    const max = Math.max(...dailyWorkload.map((day) => day.estimatedHours));
    return max > 0 ? max : 8; // Usar 8 horas como valor por defecto si no hay tareas
  }, [dailyWorkload]);

  // Determinar si hay sobrecarga de trabajo (más de 8 horas en un día)
  const hasOverload = useMemo(() => {
    return dailyWorkload.some((day) => day.estimatedHours > 8);
  }, [dailyWorkload]);

  if (activeTasks.length === 0) {
    return (
      <div class="bg-white shadow-md rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Resumen de Carga de Trabajo</h3>
        <p class="text-gray-500 text-sm">No hay tareas activas con horas estimadas.</p>
      </div>
    );
  }

  // Renderizar la vista diaria
  const renderDailyView = () => (
    <div class="space-y-3">
      {dailyWorkload.map((day) => (
        <div key={day.date.toISOString()} class="flex items-center">
          <div class="w-24 text-sm text-gray-600">{day.formattedDate}</div>
          <div class="flex-1">
            <div class="relative h-6 bg-gray-100 rounded overflow-hidden">
              <div
                class={`absolute top-0 left-0 h-full ${
                  day.estimatedHours > 8 ? "bg-red-300" : "bg-blue-300"
                }`}
                style={{ width: `${Math.min(100, (day.estimatedHours / maxHours) * 100)}%` }}
              />
              <div class="absolute top-0 left-0 w-full h-full flex items-center px-2">
                <span class="text-xs font-medium">
                  {day.estimatedHours > 0 ? `${day.estimatedHours}h` : "Sin tareas"}
                </span>
              </div>
            </div>
          </div>
          <div class="w-8 text-center text-xs text-gray-500">
            {day.tasks.length > 0 ? `${day.tasks.length}` : ""}
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizar la vista semanal
  const renderWeeklyView = () => (
    <div class="space-y-3">
      {weeklyWorkload.map((week) => (
        <div key={week.weekStart.toISOString()} class="flex items-center">
          <div class="w-32 text-sm text-gray-600">{week.formattedRange}</div>
          <div class="flex-1">
            <div class="relative h-6 bg-gray-100 rounded overflow-hidden">
              <div
                class={`absolute top-0 left-0 h-full ${
                  week.estimatedHours > 40 ? "bg-red-300" : "bg-blue-300"
                }`}
                style={{ width: `${Math.min(100, (week.estimatedHours / (maxHours * 5)) * 100)}%` }}
              />
              <div class="absolute top-0 left-0 w-full h-full flex items-center px-2">
                <span class="text-xs font-medium">
                  {week.estimatedHours > 0 ? `${week.estimatedHours}h` : "Sin tareas"}
                </span>
              </div>
            </div>
          </div>
          <div class="w-8 text-center text-xs text-gray-500">
            {week.tasks.length > 0 ? `${week.tasks.length}` : ""}
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizar la vista por proyecto
  const renderProjectView = () => (
    <div class="space-y-3">
      {projectWorkload.map((project) => (
        <div key={project.projectId} class="flex items-center">
          <div class="w-32 text-sm text-gray-600 truncate" title={project.projectName}>
            {project.projectName}
          </div>
          <div class="flex-1">
            <div class="relative h-6 bg-gray-100 rounded overflow-hidden">
              <div
                class="absolute top-0 left-0 h-full bg-green-300"
                style={{ width: `${Math.min(100, (project.estimatedHours / maxHours) * 100)}%` }}
              />
              <div class="absolute top-0 left-0 w-full h-full flex items-center px-2">
                <span class="text-xs font-medium">
                  {project.estimatedHours > 0 ? `${project.estimatedHours}h` : "Sin tareas"}
                </span>
              </div>
            </div>
          </div>
          <div class="w-8 text-center text-xs text-gray-500">
            {project.tasks.length > 0 ? `${project.tasks.length}` : ""}
          </div>
        </div>
      ))}
    </div>
  );

  // Renderizar la vista por estado
  const renderStatusView = () => (
    <div class="space-y-3">
      {statusWorkload.map((status) => (
        <div key={status.status} class="flex items-center">
          <div class="w-24 text-sm text-gray-600">{status.statusName}</div>
          <div class="flex-1">
            <div class="relative h-6 bg-gray-100 rounded overflow-hidden">
              <div
                class={`absolute top-0 left-0 h-full ${
                  status.status === TaskStatus.TODO
                    ? "bg-gray-300"
                    : status.status === TaskStatus.IN_PROGRESS
                      ? "bg-blue-300"
                      : status.status === TaskStatus.REVIEW
                        ? "bg-yellow-300"
                        : status.status === TaskStatus.BLOCKED
                          ? "bg-red-300"
                          : "bg-green-300"
                }`}
                style={{ width: `${Math.min(100, (status.estimatedHours / maxHours) * 100)}%` }}
              />
              <div class="absolute top-0 left-0 w-full h-full flex items-center px-2">
                <span class="text-xs font-medium">
                  {status.estimatedHours > 0 ? `${status.estimatedHours}h` : "Sin tareas"}
                </span>
              </div>
            </div>
          </div>
          <div class="w-8 text-center text-xs text-gray-500">
            {status.tasks.length > 0 ? `${status.tasks.length}` : ""}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Resumen de Carga de Trabajo</h3>

        <div class="flex space-x-2 items-center">
          <div class="flex space-x-1">
            <button
              type="button"
              onClick={() => setViewMode("daily")}
              class={`px-2 py-1 text-xs rounded-md ${
                viewMode === "daily"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              Diario
            </button>
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              class={`px-2 py-1 text-xs rounded-md ${
                viewMode === "weekly"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setViewMode("byProject")}
              class={`px-2 py-1 text-xs rounded-md ${
                viewMode === "byProject"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              Por Proyecto
            </button>
            <button
              type="button"
              onClick={() => setViewMode("byStatus")}
              class={`px-2 py-1 text-xs rounded-md ${
                viewMode === "byStatus"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              Por Estado
            </button>
          </div>

          {/* Botón de configuración */}
          <button
            type="button"
            onClick={openPreferences}
            class="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            title="Configurar preferencias"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              role="img"
            >
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {hasOverload && (
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded mb-4 text-sm">
          <p>⚠️ Algunos días tienen más de 8 horas de trabajo estimado.</p>
        </div>
      )}

      {viewMode === "daily" && renderDailyView()}
      {viewMode === "weekly" && renderWeeklyView()}
      {viewMode === "byProject" && renderProjectView()}
      {viewMode === "byStatus" && renderStatusView()}

      <div class="mt-4 text-xs text-gray-500">
        <p>* Las fechas límite son simuladas para esta demostración.</p>
      </div>

      {/* Métricas simplificadas */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="bg-blue-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">Total de tareas</div>
          <div class="text-xl font-semibold">{activeTasks.length}</div>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">Total de horas</div>
          <div class="text-xl font-semibold">
            {activeTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0).toFixed(1)}h
          </div>
        </div>
        <div class="bg-yellow-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">Promedio por tarea</div>
          <div class="text-xl font-semibold">
            {activeTasks.length > 0
              ? (
                  activeTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0) /
                  activeTasks.length
                ).toFixed(1)
              : "0"}
            h
          </div>
        </div>
        <div class="bg-purple-50 p-3 rounded-lg">
          <div class="text-sm text-gray-600">En progreso</div>
          <div class="text-xl font-semibold">
            {statusWorkload.find((s) => s.status === TaskStatus.IN_PROGRESS)?.tasks.length || 0}
          </div>
        </div>
      </div>

      {/* Modal de preferencias */}
      {showPreferences && <WorkloadPreferences onClose={closePreferences} />}
    </div>
  );
}
