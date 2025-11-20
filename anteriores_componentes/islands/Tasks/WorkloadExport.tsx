import { useState } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";

interface DailyData {
  date: Date;
  totalHours: number;
  tasks: Task[];
}

interface ProjectData {
  projectName: string;
  totalHours: number;
  tasks: Task[];
}

interface StatusData {
  statusName: string;
  totalHours: number;
  tasks: Task[];
}

interface WorkloadExportProps {
  tasks: Task[];
  projects: Record<string, Project>;
  userStories: Record<string, UserStory>;
  getTaskDueDate: (task: Task) => Date;
}

export default function WorkloadExport({
  tasks,
  projects,
  userStories,
  getTaskDueDate,
}: WorkloadExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportType, setExportType] = useState<"daily" | "weekly" | "byProject" | "byStatus">(
    "daily"
  );

  // Función para obtener el nombre del proyecto de una tarea
  const getProjectName = (task: Task): string => {
    const userStory = userStories[task.userStoryId];
    if (!userStory) return "Proyecto desconocido";

    const project = projects[userStory.projectId];
    return project ? project.name : "Proyecto desconocido";
  };

  // Función para obtener el nombre del estado
  const getStatusName = (status: TaskStatus): string => {
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
  };

  // Función para generar datos de exportación diaria
  const generateDailyExportData = () => {
    // Filtrar tareas que tienen horas estimadas y no están completadas
    const activeTasks = tasks.filter(
      (task) => task.estimatedHours !== undefined && task.status !== TaskStatus.DONE
    );

    // Agrupar tareas por fecha
    const tasksByDate: Record<string, { date: Date; tasks: Task[]; totalHours: number }> = {};

    for (const task of activeTasks) {
      const dueDate = getTaskDueDate(task);
      const dateKey = dueDate.toISOString().split("T")[0];

      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = {
          date: new Date(dueDate),
          tasks: [],
          totalHours: 0,
        };
      }

      tasksByDate[dateKey].tasks.push(task);
      tasksByDate[dateKey].totalHours += task.estimatedHours || 0;
    }

    // Convertir a array y ordenar por fecha
    return Object.values(tasksByDate).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Función para generar datos de exportación por proyecto
  const generateProjectExportData = () => {
    // Filtrar tareas que tienen horas estimadas y no están completadas
    const activeTasks = tasks.filter(
      (task) => task.estimatedHours !== undefined && task.status !== TaskStatus.DONE
    );

    // Agrupar tareas por proyecto
    const tasksByProject: Record<
      string,
      { projectId: string; projectName: string; tasks: Task[]; totalHours: number }
    > = {};

    for (const task of activeTasks) {
      const userStory = userStories[task.userStoryId];
      if (!userStory) continue;

      const projectId = userStory.projectId;
      const projectName = getProjectName(task);

      if (!tasksByProject[projectId]) {
        tasksByProject[projectId] = {
          projectId,
          projectName,
          tasks: [],
          totalHours: 0,
        };
      }

      tasksByProject[projectId].tasks.push(task);
      tasksByProject[projectId].totalHours += task.estimatedHours || 0;
    }

    // Convertir a array y ordenar por horas totales (descendente)
    return Object.values(tasksByProject).sort((a, b) => b.totalHours - a.totalHours);
  };

  // Función para generar datos de exportación por estado
  const generateStatusExportData = () => {
    // Filtrar tareas que tienen horas estimadas y no están completadas
    const activeTasks = tasks.filter(
      (task) => task.estimatedHours !== undefined && task.status !== TaskStatus.DONE
    );

    // Agrupar tareas por estado
    const tasksByStatus: Record<
      string,
      { status: TaskStatus; statusName: string; tasks: Task[]; totalHours: number }
    > = {};

    for (const task of activeTasks) {
      const status = task.status;
      const statusName = getStatusName(status);

      if (!tasksByStatus[status]) {
        tasksByStatus[status] = {
          status,
          statusName,
          tasks: [],
          totalHours: 0,
        };
      }

      tasksByStatus[status].tasks.push(task);
      tasksByStatus[status].totalHours += task.estimatedHours || 0;
    }

    // Convertir a array
    return Object.values(tasksByStatus);
  };

  // Función para exportar datos en formato CSV
  const exportAsCSV = (data: unknown[]) => {
    let csvContent = "";

    // Cabeceras según el tipo de exportación
    if (exportType === "daily") {
      csvContent = "Fecha,Total Horas,Número de Tareas\n";

      for (const day of data as DailyData[]) {
        const formattedDate = day.date.toLocaleDateString("es-ES");
        csvContent += `"${formattedDate}",${day.totalHours},${day.tasks.length}\n`;
      }
    } else if (exportType === "byProject") {
      csvContent = "Proyecto,Total Horas,Número de Tareas\n";

      for (const project of data as ProjectData[]) {
        csvContent += `"${project.projectName}",${project.totalHours},${project.tasks.length}\n`;
      }
    } else if (exportType === "byStatus") {
      csvContent = "Estado,Total Horas,Número de Tareas\n";

      for (const status of data as StatusData[]) {
        csvContent += `"${status.statusName}",${status.totalHours},${status.tasks.length}\n`;
      }
    }

    // Crear un blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `carga-trabajo-${exportType}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para exportar datos en formato JSON
  const exportAsJSON = (data: unknown[]) => {
    // Crear un blob y descargar
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `carga-trabajo-${exportType}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para manejar la exportación
  const handleExport = () => {
    setIsExporting(true);

    try {
      let dataToExport;

      // Generar datos según el tipo de exportación
      if (exportType === "daily") {
        dataToExport = generateDailyExportData();
      } else if (exportType === "byProject") {
        dataToExport = generateProjectExportData();
      } else if (exportType === "byStatus") {
        dataToExport = generateStatusExportData();
      } else {
        // Por defecto, exportar datos diarios
        dataToExport = generateDailyExportData();
      }

      // Exportar según el formato seleccionado
      if (exportFormat === "csv") {
        exportAsCSV(dataToExport);
      } else {
        exportAsJSON(dataToExport);
      }
    } catch (error) {
      console.error("Error al exportar datos:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Exportar Datos</h4>

      <div class="flex flex-col sm:flex-row gap-2 mb-3">
        <div>
          <label class="block text-xs text-gray-600 mb-1" htmlFor="export-type">
            Tipo de datos
          </label>
          <select
            id="export-type"
            value={exportType}
            onChange={(e) => setExportType((e.target as HTMLSelectElement).value as "daily" | "weekly" | "byProject" | "byStatus")}
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Carga diaria</option>
            <option value="byProject">Por proyecto</option>
            <option value="byStatus">Por estado</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-600 mb-1" htmlFor="export-format">
            Formato
          </label>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat((e.target as HTMLSelectElement).value as "csv" | "json")}
            class="w-full px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div class="self-end">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            class="px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isExporting ? "Exportando..." : "Exportar"}
          </button>
        </div>
      </div>

      <p class="text-xs text-gray-500">
        Exporta los datos de carga de trabajo para análisis o informes.
      </p>
    </div>
  );
}
