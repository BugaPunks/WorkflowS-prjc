import { useCallback, useMemo, useState } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";

interface TaskCalendarViewProps {
  tasks: Task[];
  projects: Record<string, Project>;
  userStories: Record<string, UserStory>;
}

// Tipo para representar una tarea en el calendario
interface CalendarTask {
  id: string;
  title: string;
  status: TaskStatus;
  date: Date;
  project: string;
  userStory: string;
}

export default function TaskCalendarView({ tasks, projects, userStories }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<"month" | "week">("week");

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

  // Función para obtener el color según el estado
  const getStatusColor = useCallback((status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 border-gray-300";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 border-blue-300";
      case TaskStatus.REVIEW:
        return "bg-yellow-100 border-yellow-300";
      case TaskStatus.DONE:
        return "bg-green-100 border-green-300";
      case TaskStatus.BLOCKED:
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  }, []);

  // Preparar tareas para el calendario
  const calendarTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== TaskStatus.DONE) // Excluir tareas completadas
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        date: getTaskDueDate(task),
        project: getProjectName(task),
        userStory: getUserStoryTitle(task),
      }));
  }, [tasks, getTaskDueDate, getProjectName, getUserStoryTitle]);

  // Generar días para la vista de semana
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    // Ajustar al lunes de la semana actual
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  // Generar días para la vista de mes
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    // Último día del mes
    const _lastDayOfMonth = new Date(year, month + 1, 0);

    // Día de la semana del primer día (0 = domingo, 1 = lunes, ...)
    const firstDayWeekday = firstDayOfMonth.getDay();
    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    const firstDayIndex = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

    // Calcular cuántos días del mes anterior necesitamos mostrar
    const daysFromPrevMonth = firstDayIndex;

    // Calcular el primer día a mostrar (puede ser del mes anterior)
    const firstDay = new Date(firstDayOfMonth);
    firstDay.setDate(firstDay.getDate() - daysFromPrevMonth);

    // Calcular cuántos días necesitamos en total para mostrar semanas completas
    // (42 días = 6 semanas, suficiente para cualquier mes)
    const totalDays = 42;

    // Generar array de días
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      days.push(date);
    }

    return days;
  }, [currentDate]);

  // Obtener tareas para un día específico
  const getTasksForDay = useCallback(
    (date: Date) => {
      return calendarTasks.filter((task) => {
        const taskDate = new Date(task.date);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });
    },
    [calendarTasks]
  );

  // Navegar a la semana/mes anterior
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navegar a la semana/mes siguiente
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Navegar a la semana/mes actual
  const goToCurrent = () => {
    setCurrentDate(new Date());
  };

  // Formatear fecha para mostrar
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Obtener el título del calendario según la vista
  const getCalendarTitle = () => {
    if (currentView === "week") {
      return weekDays[0].toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    }
    return currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  // Verificar si una fecha es del mes actual
  const isCurrentMonth = (date: Date): boolean => {
    return (
      date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Cabecera del calendario */}
      <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div class="flex space-x-2">
          <button
            type="button"
            onClick={goToPrevious}
            class="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50"
          >
            &larr; Anterior
          </button>
          <button
            type="button"
            onClick={goToCurrent}
            class="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={goToNext}
            class="px-3 py-1 rounded-md text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50"
          >
            Siguiente &rarr;
          </button>
        </div>
        <h3 class="text-lg font-semibold text-gray-800">{getCalendarTitle()}</h3>
        <div class="flex space-x-2">
          <button
            type="button"
            onClick={() => setCurrentView("week")}
            class={`px-3 py-1 rounded-md text-sm font-medium ${
              currentView === "week"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("month")}
            class={`px-3 py-1 rounded-md text-sm font-medium ${
              currentView === "month"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Vista de semana */}
      {currentView === "week" && (
        <div class="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day) => (
            <div key={day.toISOString()} class="bg-white">
              {/* Cabecera del día */}
              <div
                class={`px-2 py-1 text-center border-b ${
                  isToday(day) ? "bg-blue-50 border-blue-200" : "border-gray-200"
                }`}
              >
                <div class="text-xs text-gray-500">{formatDate(day)}</div>
              </div>

              {/* Tareas del día */}
              <div class="min-h-[150px] p-1">
                {getTasksForDay(day).map((task) => (
                  <a
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    class={`block p-2 mb-1 text-xs rounded border ${getStatusColor(
                      task.status
                    )} hover:opacity-90`}
                  >
                    <div class="font-medium truncate">{task.title}</div>
                    <div class="text-xs text-gray-500 truncate">{task.project}</div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de mes */}
      {currentView === "month" && (
        <div>
          {/* Cabecera de días de la semana */}
          <div class="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
            <div class="text-sm font-medium text-gray-500">Lun</div>
            <div class="text-sm font-medium text-gray-500">Mar</div>
            <div class="text-sm font-medium text-gray-500">Mié</div>
            <div class="text-sm font-medium text-gray-500">Jue</div>
            <div class="text-sm font-medium text-gray-500">Vie</div>
            <div class="text-sm font-medium text-gray-500">Sáb</div>
            <div class="text-sm font-medium text-gray-500">Dom</div>
          </div>

          {/* Cuadrícula del mes */}
          <div class="grid grid-cols-7 gap-px bg-gray-200">
            {monthDays.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonthDay = isCurrentMonth(day);

              return (
                <div
                  key={day.toISOString()}
                  class={`bg-white min-h-[100px] ${isCurrentMonthDay ? "" : "bg-gray-50"}`}
                >
                  {/* Número del día */}
                  <div
                    class={`px-2 py-1 text-right border-b ${
                      isToday(day)
                        ? "bg-blue-50 border-blue-200"
                        : isCurrentMonthDay
                          ? "border-gray-200"
                          : "border-gray-100 text-gray-400"
                    }`}
                  >
                    <span class="text-sm">{day.getDate()}</span>
                  </div>

                  {/* Tareas del día (mostrar solo 2 máximo) */}
                  <div class="p-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <a
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        class={`block p-1 mb-1 text-xs rounded border ${getStatusColor(
                          task.status
                        )} hover:opacity-90`}
                      >
                        <div class="font-medium truncate text-xs">{task.title}</div>
                      </a>
                    ))}

                    {/* Indicador de más tareas */}
                    {dayTasks.length > 2 && (
                      <div class="text-xs text-center text-gray-500 mt-1">
                        +{dayTasks.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
