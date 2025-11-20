import { ReportFormat } from "@/models/report.ts";
import { useState } from "preact/hooks";

interface Report {
  id: string;
  title: string;
  type: string;
  createdAt: number;
  createdBy: string;
  exportFormats: string[];
}

interface ScheduledReport {
  id: string;
  title: string;
  frequency: string;
  nextRunTime: number;
  createdBy: string;
}

interface ReportsListProps {
  reports: Report[];
  scheduledReports: ScheduledReport[];
  projectId: string;
}

export default function ReportsList({ reports, scheduledReports, projectId }: ReportsListProps) {
  const [activeTab, setActiveTab] = useState<"saved" | "scheduled">("saved");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const exportReport = async (reportId: string, format: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al exportar el reporte");
      }

      const data = await response.json();

      // Si es formato JSON, mostrar los datos
      if (format === ReportFormat.JSON) {
        console.log("Datos del reporte:", data);
        setSuccess("Datos del reporte obtenidos correctamente");
        return;
      }

      // Para otros formatos, abrir la URL de descarga
      if (data.url) {
        globalThis.open(data.url, "_blank");
        setSuccess("Reporte exportado correctamente");
      }
    } catch (err) {
      console.error(`Error al exportar reporte en formato ${format}:`, err);
      setError(err instanceof Error ? err.message : `Error al exportar el reporte en formato ${format}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este reporte?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el reporte");
      }

      setSuccess("Reporte eliminado correctamente");

      // Actualizar la lista de reportes
      globalThis.location.reload();
    } catch (err) {
      console.error("Error al eliminar reporte:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduledReport = async (reportId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este reporte programado?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/reports/schedule/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el reporte programado");
      }

      setSuccess("Reporte programado eliminado correctamente");

      // Actualizar la lista de reportes programados
      globalThis.location.reload();
    } catch (err) {
      console.error("Error al eliminar reporte programado:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar el reporte programado");
    } finally {
      setLoading(false);
    }
  };

  // Formatear tipo de reporte
  const formatReportType = (type: string): string => {
    const types: Record<string, string> = {
      sprint_summary: "Resumen de Sprint",
      project_progress: "Progreso del Proyecto",
      team_performance: "Rendimiento del Equipo",
      user_performance: "Rendimiento de Usuario",
      custom: "Personalizado",
    };

    return types[type] || type;
  };

  // Formatear frecuencia de reporte programado
  const formatFrequency = (frequency: string): string => {
    const frequencies: Record<string, string> = {
      daily: "Diario",
      weekly: "Semanal",
      monthly: "Mensual",
      end_of_sprint: "Al finalizar sprint",
    };

    return frequencies[frequency] || frequency;
  };

  return (
    <div class="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div class="flex border-b">
        <button
          type="button"
          class={`px-4 py-2 text-sm font-medium ${
            activeTab === "saved"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("saved")}
        >
          Reportes Guardados
        </button>
        <button
          type="button"
          class={`px-4 py-2 text-sm font-medium ${
            activeTab === "scheduled"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("scheduled")}
        >
          Reportes Programados
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}

      {success && (
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-4 rounded">
          {success}
        </div>
      )}

      {/* Contenido de la pestaña activa */}
      <div class="p-4">
        {activeTab === "saved" &&
          (reports.length === 0 ? (
            <div class="text-center py-8">
              <p class="text-gray-500">
                No hay reportes guardados. Genera un nuevo reporte para comenzar.
              </p>
              <a
                href={`/projects/${projectId}/reports/generate`}
                class="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Generar Nuevo Reporte
              </a>
            </div>
          ) : (
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{report.title}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">{formatReportType(report.type)}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          <div class="relative group">
                            <button type="button" class="text-blue-600 hover:text-blue-900">
                              Exportar
                            </button>
                            <div class="absolute z-10 hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg p-2 mt-1">
                              {report.exportFormats.map((format) => (
                                <button
                                  type="button"
                                  key={format}
                                  class="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
                                  onClick={() => exportReport(report.id, format)}
                                  disabled={loading}
                                >
                                  {format.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            class="text-red-600 hover:text-red-900"
                            onClick={() => deleteReport(report.id)}
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {activeTab === "scheduled" &&
          (scheduledReports.length === 0 ? (
            <div class="text-center py-8">
              <p class="text-gray-500">
                No hay reportes programados. Programa un nuevo reporte para comenzar.
              </p>
              <a
                href={`/projects/${projectId}/reports/schedule`}
                class="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Programar Nuevo Reporte
              </a>
            </div>
          ) : (
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frecuencia
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próxima Ejecución
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {scheduledReports.map((report) => (
                    <tr key={report.id}>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{report.title}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">{formatFrequency(report.frequency)}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500">
                          {new Date(report.nextRunTime).toLocaleString()}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                          <a
                            href={`/projects/${projectId}/reports/schedule/${report.id}`}
                            class="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </a>
                          <button
                            type="button"
                            class="text-red-600 hover:text-red-900"
                            onClick={() => deleteScheduledReport(report.id)}
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}
