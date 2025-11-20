import { useMemo } from "preact/hooks";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";

interface WorkloadMetricsProps {
  tasks: Task[];
  getTaskDueDate: (task: Task) => Date;
}

export default function WorkloadMetrics({ tasks, getTaskDueDate }: WorkloadMetricsProps) {
  // Filtrar tareas que tienen horas estimadas y no están completadas
  const activeTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.estimatedHours !== undefined && task.status !== TaskStatus.DONE
    );
  }, [tasks]);

  // Calcular métricas
  const metrics = useMemo(() => {
    // Inicializar métricas
    const result = {
      totalTasks: activeTasks.length,
      totalHours: 0,
      avgHoursPerTask: 0,
      tasksPerStatus: {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.REVIEW]: 0,
        [TaskStatus.DONE]: 0,
        [TaskStatus.BLOCKED]: 0,
      },
      hoursPerStatus: {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.REVIEW]: 0,
        [TaskStatus.DONE]: 0,
        [TaskStatus.BLOCKED]: 0,
      },
      overdueTasks: 0,
      dueTodayTasks: 0,
      dueThisWeekTasks: 0,
    };

    // Si no hay tareas, devolver métricas vacías
    if (activeTasks.length === 0) {
      return result;
    }

    // Fecha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calcular fin de semana
    const endOfWeek = new Date(today);
    const dayOfWeek = endOfWeek.getDay();
    const daysUntilEndOfWeek = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilEndOfWeek);
    endOfWeek.setHours(23, 59, 59, 999);

    // Calcular métricas
    for (const task of activeTasks) {
      // Sumar horas estimadas
      const hours = task.estimatedHours || 0;
      result.totalHours += hours;

      // Contar tareas por estado
      result.tasksPerStatus[task.status]++;

      // Sumar horas por estado
      result.hoursPerStatus[task.status] += hours;

      // Verificar fechas límite
      const dueDate = getTaskDueDate(task);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        result.overdueTasks++;
      } else if (dueDate.getTime() === today.getTime()) {
        result.dueTodayTasks++;
      } else if (dueDate <= endOfWeek) {
        result.dueThisWeekTasks++;
      }
    }

    // Calcular promedio de horas por tarea
    result.avgHoursPerTask = result.totalHours / result.totalTasks;

    return result;
  }, [activeTasks, getTaskDueDate]);

  // Si no hay tareas activas
  if (activeTasks.length === 0) {
    return (
      <div class="mt-4 pt-4 border-t border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Métricas de Carga de Trabajo</h4>
        <p class="text-xs text-gray-500">No hay tareas activas con horas estimadas.</p>
      </div>
    );
  }

  return (
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Métricas de Carga de Trabajo</h4>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-gray-50 p-2 rounded-md">
          <div class="text-xs text-gray-500">Total de tareas</div>
          <div class="text-lg font-semibold text-gray-800">{metrics.totalTasks}</div>
        </div>

        <div class="bg-gray-50 p-2 rounded-md">
          <div class="text-xs text-gray-500">Total de horas</div>
          <div class="text-lg font-semibold text-gray-800">{metrics.totalHours.toFixed(1)}h</div>
        </div>

        <div class="bg-gray-50 p-2 rounded-md">
          <div class="text-xs text-gray-500">Promedio por tarea</div>
          <div class="text-lg font-semibold text-gray-800">
            {metrics.avgHoursPerTask.toFixed(1)}h
          </div>
        </div>

        <div class="bg-gray-50 p-2 rounded-md">
          <div class="text-xs text-gray-500">Tareas vencidas</div>
          <div
            class={`text-lg font-semibold ${metrics.overdueTasks > 0 ? "text-red-600" : "text-gray-800"}`}
          >
            {metrics.overdueTasks}
          </div>
        </div>
      </div>

      <div class="mb-3">
        <h5 class="text-xs font-medium text-gray-600 mb-1">Distribución por estado</h5>
        <div class="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          {metrics.tasksPerStatus[TaskStatus.TODO] > 0 && (
            <div
              class="h-full bg-gray-300"
              style={{
                width: `${(metrics.tasksPerStatus[TaskStatus.TODO] / metrics.totalTasks) * 100}%`,
              }}
              title={`Por hacer: ${metrics.tasksPerStatus[TaskStatus.TODO]} tareas`}
            />
          )}
          {metrics.tasksPerStatus[TaskStatus.IN_PROGRESS] > 0 && (
            <div
              class="h-full bg-blue-300"
              style={{
                width: `${(metrics.tasksPerStatus[TaskStatus.IN_PROGRESS] / metrics.totalTasks) * 100}%`,
              }}
              title={`En progreso: ${metrics.tasksPerStatus[TaskStatus.IN_PROGRESS]} tareas`}
            />
          )}
          {metrics.tasksPerStatus[TaskStatus.REVIEW] > 0 && (
            <div
              class="h-full bg-yellow-300"
              style={{
                width: `${(metrics.tasksPerStatus[TaskStatus.REVIEW] / metrics.totalTasks) * 100}%`,
              }}
              title={`En revisión: ${metrics.tasksPerStatus[TaskStatus.REVIEW]} tareas`}
            />
          )}
          {metrics.tasksPerStatus[TaskStatus.BLOCKED] > 0 && (
            <div
              class="h-full bg-red-300"
              style={{
                width: `${(metrics.tasksPerStatus[TaskStatus.BLOCKED] / metrics.totalTasks) * 100}%`,
              }}
              title={`Bloqueadas: ${metrics.tasksPerStatus[TaskStatus.BLOCKED]} tareas`}
            />
          )}
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <div>Por hacer: {metrics.tasksPerStatus[TaskStatus.TODO]}</div>
          <div>En progreso: {metrics.tasksPerStatus[TaskStatus.IN_PROGRESS]}</div>
          <div>En revisión: {metrics.tasksPerStatus[TaskStatus.REVIEW]}</div>
          <div>Bloqueadas: {metrics.tasksPerStatus[TaskStatus.BLOCKED]}</div>
        </div>
      </div>

      <div class="text-xs text-gray-500 flex justify-between">
        <div>
          <span class="font-medium">Hoy:</span> {metrics.dueTodayTasks} tareas
        </div>
        <div>
          <span class="font-medium">Esta semana:</span> {metrics.dueThisWeekTasks} tareas
        </div>
      </div>
    </div>
  );
}
