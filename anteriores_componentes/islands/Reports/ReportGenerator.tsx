import { ReportFormat, ReportType } from "@/models/report.ts";
import { useState } from "preact/hooks";

interface Sprint {
  id: string;
  name: string;
  status: string;
}

interface Member {
  userId: string;
  userName: string;
  role: string;
}

interface ReportGeneratorProps {
  projectId: string;
  sprints: Sprint[];
  members: Member[];
  reportTypes: string[];
  exportFormats: string[];
}

interface ReportConfig {
  title: string;
  description: string;
  type: string;
  projectId: string;
  sprintId?: string;
  userId?: string;
  includeBurndown: boolean;
  includeVelocity: boolean;
  includeUserMetrics: boolean;
  includeProjectHealth: boolean;
  exportFormats: string[];
}

export default function ReportGenerator({
  projectId,
  sprints,
  members,
  reportTypes,
  exportFormats,
}: ReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    title: "Nuevo Reporte",
    description: "",
    type: ReportType.PROJECT_PROGRESS,
    projectId,
    includeBurndown: true,
    includeVelocity: true,
    includeUserMetrics: false,
    includeProjectHealth: true,
    exportFormats: [ReportFormat.HTML],
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;

    setConfig({
      ...config,
      [name]: value,
    });
  };

  const handleExportFormatChange = (format: string) => {
    const currentFormats = [...config.exportFormats];

    if (currentFormats.includes(format)) {
      setConfig({
        ...config,
        exportFormats: currentFormats.filter((f) => f !== format),
      });
    } else {
      setConfig({
        ...config,
        exportFormats: [...currentFormats, format],
      });
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setReportId(null);

      // Validar configuración
      if (!config.title.trim()) {
        throw new Error("El título del reporte es obligatorio");
      }

      if (config.exportFormats.length === 0) {
        throw new Error("Debes seleccionar al menos un formato de exportación");
      }

      // Enviar solicitud para generar el reporte
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al generar el reporte");
      }

      const report = await response.json();

      setSuccess("Reporte generado correctamente");
      setReportId(report.id);
    } catch (err) {
      console.error("Error al generar reporte:", err);
      setError(err instanceof Error ? err.message : "Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: string) => {
    if (!reportId) return;

    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al exportar el reporte");
      }

      const data = await response.json();

      // Si es formato JSON, mostrar los datos
      if (format === ReportFormat.JSON) {
        console.log("Datos del reporte:", data);
        return;
      }

      // Para otros formatos, abrir la URL de descarga
      if (data.url) {
        globalThis.open(data.url, "_blank");
      }
    } catch (err) {
      console.error(`Error al exportar reporte en formato ${format}:`, err);
      setError(err instanceof Error ? err.message : `Error al exportar el reporte en formato ${format}`);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de configuración */}
        <div>
          <h2 class="text-xl font-semibold mb-4">Configuración del Reporte</h2>

          {error && (
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Título
            </label>
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              name="title"
              type="text"
              value={config.title}
              onChange={handleChange}
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descripción
            </label>
            <textarea
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              rows={3}
              value={config.description}
              onChange={handleChange}
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Tipo de Reporte
            </label>
            <select
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="type"
              name="type"
              value={config.type}
              onChange={handleChange}
            >
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {formatReportType(type)}
                </option>
              ))}
            </select>
          </div>

          {sprints.length > 0 && (
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="sprintId">
                Sprint
              </label>
              <select
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="sprintId"
                name="sprintId"
                value={config.sprintId || ""}
                onChange={handleChange}
              >
                <option value="">Todos los sprints</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {members.length > 0 && (
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
                Miembro del Equipo
              </label>
              <select
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="userId"
                name="userId"
                value={config.userId || ""}
                onChange={handleChange}
              >
                <option value="">Todos los miembros</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.userName} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div class="mb-4">
            <h3 class="text-gray-700 text-sm font-bold mb-2">Secciones a Incluir</h3>

            <div class="flex items-center mb-2">
              <input
                class="mr-2 leading-tight"
                type="checkbox"
                id="includeBurndown"
                name="includeBurndown"
                checked={config.includeBurndown}
                onChange={handleChange}
              />
              <label class="text-sm" htmlFor="includeBurndown">
                Gráfico de Burndown
              </label>
            </div>

            <div class="flex items-center mb-2">
              <input
                class="mr-2 leading-tight"
                type="checkbox"
                id="includeVelocity"
                name="includeVelocity"
                checked={config.includeVelocity}
                onChange={handleChange}
              />
              <label class="text-sm" htmlFor="includeVelocity">
                Velocidad del Equipo
              </label>
            </div>

            <div class="flex items-center mb-2">
              <input
                class="mr-2 leading-tight"
                type="checkbox"
                id="includeUserMetrics"
                name="includeUserMetrics"
                checked={config.includeUserMetrics}
                onChange={handleChange}
              />
              <label class="text-sm" htmlFor="includeUserMetrics">
                Métricas de Usuarios
              </label>
            </div>

            <div class="flex items-center">
              <input
                class="mr-2 leading-tight"
                type="checkbox"
                id="includeProjectHealth"
                name="includeProjectHealth"
                checked={config.includeProjectHealth}
                onChange={handleChange}
              />
              <label class="text-sm" htmlFor="includeProjectHealth">
                Salud del Proyecto
              </label>
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-gray-700 text-sm font-bold mb-2">Formatos de Exportación</h3>

            <div class="flex flex-wrap">
              {exportFormats.map((format) => (
                <div key={format} class="w-1/2 flex items-center mb-2">
                  <input
                    class="mr-2 leading-tight"
                    type="checkbox"
                    id={`format-${format}`}
                    checked={config.exportFormats.includes(format)}
                    onChange={() => handleExportFormatChange(format)}
                  />
                  <label class="text-sm" htmlFor={`format-${format}`}>
                    {format.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? "Generando..." : "Generar Reporte"}
            </button>
          </div>
        </div>

        {/* Vista previa y exportación */}
        <div>
          <h2 class="text-xl font-semibold mb-4">Vista Previa</h2>

          <div class="bg-gray-100 rounded-lg p-4 mb-4">
            <h3 class="font-bold text-lg mb-2">{config.title}</h3>

            {config.description && <p class="text-gray-700 mb-4">{config.description}</p>}

            <div class="mb-4">
              <p class="text-sm text-gray-600">
                <span class="font-semibold">Tipo:</span> {formatReportType(config.type)}
              </p>

              {config.sprintId && (
                <p class="text-sm text-gray-600">
                  <span class="font-semibold">Sprint:</span>{" "}
                  {sprints.find((s) => s.id === config.sprintId)?.name || ""}
                </p>
              )}

              {config.userId && (
                <p class="text-sm text-gray-600">
                  <span class="font-semibold">Usuario:</span>{" "}
                  {members.find((m) => m.userId === config.userId)?.userName || ""}
                </p>
              )}
            </div>

            <div class="mb-4">
              <h4 class="font-semibold text-sm mb-1">Secciones incluidas:</h4>
              <ul class="list-disc list-inside text-sm text-gray-600">
                {config.includeBurndown && <li>Gráfico de Burndown</li>}
                {config.includeVelocity && <li>Velocidad del Equipo</li>}
                {config.includeUserMetrics && <li>Métricas de Usuarios</li>}
                {config.includeProjectHealth && <li>Salud del Proyecto</li>}
              </ul>
            </div>

            <div>
              <h4 class="font-semibold text-sm mb-1">Formatos de exportación:</h4>
              <div class="flex flex-wrap">
                {config.exportFormats.map((format) => (
                  <span
                    key={format}
                    class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-2"
                  >
                    {format.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {reportId && (
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 class="font-bold text-lg mb-2">Reporte Generado</h3>
              <p class="text-sm text-gray-600 mb-4">
                El reporte se ha generado correctamente. Puedes exportarlo en los siguientes
                formatos:
              </p>

              <div class="flex flex-wrap">
                {config.exportFormats.map((format) => (
                  <button
                    type="button"
                    key={format}
                    class="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded mr-2 mb-2"
                    onClick={() => exportReport(format)}
                  >
                    Exportar {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para formatear el tipo de reporte
function formatReportType(type: string): string {
  switch (type) {
    case ReportType.SPRINT_SUMMARY:
      return "Resumen de Sprint";
    case ReportType.PROJECT_PROGRESS:
      return "Progreso del Proyecto";
    case ReportType.TEAM_PERFORMANCE:
      return "Rendimiento del Equipo";
    case ReportType.USER_PERFORMANCE:
      return "Rendimiento de Usuario";
    case ReportType.CUSTOM:
      return "Personalizado";
    default:
      return type;
  }
}
