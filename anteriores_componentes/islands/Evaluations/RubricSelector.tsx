import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { type Rubric, RubricStatus } from "../../models/rubric.ts";

interface RubricSelectorProps {
  projectId?: string;
  onSelectRubric: (rubric: Rubric) => void;
  onCancel: () => void;
}

export default function RubricSelector({
  projectId,
  onSelectRubric,
  onCancel,
}: RubricSelectorProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [templates, setTemplates] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  // Cargar rúbricas
  useEffect(() => {
    const fetchRubrics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar rúbricas del proyecto o del usuario actual
        let projectRubricsUrl = "/api/rubrics";
        if (projectId) {
          projectRubricsUrl += `?projectId=${projectId}`;
        }
        // Si no hay projectId, cargar rúbricas del usuario actual (por defecto)

        const projectRubricsResponse = await fetch(projectRubricsUrl);

        if (!projectRubricsResponse.ok) {
          console.error(`Error del servidor: ${projectRubricsResponse.status} - ${projectRubricsResponse.statusText}`);
          throw new Error(`Error al cargar rúbricas: ${projectRubricsResponse.statusText}`);
        }

        const projectRubricsData = await projectRubricsResponse.json();
        console.log('Rúbricas del proyecto/usuario:', projectRubricsData);
        setRubrics(projectRubricsData);

        // Cargar plantillas de rúbricas
        const templatesResponse = await fetch("/api/rubrics?template=true");

        if (!templatesResponse.ok) {
          console.error(`Error del servidor (plantillas): ${templatesResponse.status} - ${templatesResponse.statusText}`);
          throw new Error(`Error al cargar plantillas: ${templatesResponse.statusText}`);
        }

        const templatesData = await templatesResponse.json();
        console.log('Plantillas de rúbricas:', templatesData);
        setTemplates(templatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar rúbricas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRubrics();
  }, [projectId]);

  // Filtrar rúbricas
  const filteredRubrics = (showTemplates ? templates : rubrics).filter((rubric) => {
    return (
      rubric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rubric.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Renderizar estado de la rúbrica
  const renderStatus = (status: RubricStatus) => {
    switch (status) {
      case RubricStatus.DRAFT:
        return (
          <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Borrador</span>
        );
      case RubricStatus.ACTIVE:
        return (
          <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activa</span>
        );
      case RubricStatus.ARCHIVED:
        return (
          <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Archivada</span>
        );
      default:
        return null;
    }
  };

  return (
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Seleccionar Rúbrica para Evaluación</h2>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>

        <div class="mb-4">
          <div class="flex items-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              class={`px-4 py-2 rounded-md ${!showTemplates ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Rúbricas del Proyecto
            </button>
            <button
              type="button"
              onClick={() => setShowTemplates(true)}
              class={`px-4 py-2 rounded-md ${showTemplates ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Plantillas
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar rúbricas..."
            value={searchTerm}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <p class="mt-2 text-gray-600">Cargando rúbricas...</p>
        </div>
      ) : error ? (
        <div class="p-4 text-center text-red-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="mt-2 text-blue-600 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : filteredRubrics.length === 0 ? (
        <div class="p-8 text-center text-gray-500">
          <div class="mb-4">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-lg font-medium text-gray-900 mb-2">
            No se encontraron rúbricas{showTemplates ? " plantilla" : ""}.
          </p>
          {showTemplates ? (
            <div class="text-sm text-gray-600">
              <p class="mb-2">No hay plantillas de rúbricas disponibles.</p>
              <p>
                Puedes crear plantillas en la sección de
                <a href="/rubrics" class="text-blue-600 hover:underline ml-1 font-medium">
                  Gestión de Rúbricas
                </a>
                .
              </p>
            </div>
          ) : (
            <div class="text-sm text-gray-600">
              <p class="mb-2">
                {projectId
                  ? "No hay rúbricas específicas para este proyecto."
                  : "No tienes rúbricas personales creadas."
                }
              </p>
              <p>
                Puedes crear rúbricas en la sección de
                <a href="/rubrics" class="text-blue-600 hover:underline ml-1 font-medium">
                  Gestión de Rúbricas
                </a>
                .
              </p>
              <p class="mt-3 text-xs text-gray-500">
                💡 Tip: También puedes usar las plantillas disponibles cambiando a la pestaña "Plantillas"
              </p>
            </div>
          )}
        </div>
      ) : (
        <ul class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredRubrics.map((rubric) => (
            <li key={rubric.id} class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-medium text-gray-900">{rubric.name}</h3>
                    {renderStatus(rubric.status)}
                    {rubric.isTemplate && (
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Plantilla
                      </span>
                    )}
                  </div>
                  {rubric.description && (
                    <p class="mt-1 text-sm text-gray-600">{rubric.description}</p>
                  )}
                  <p class="mt-1 text-xs text-gray-500">
                    {rubric.criteria.length} criterios •
                    {rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0)}{" "}
                    puntos posibles
                  </p>
                </div>

                <Button onClick={() => onSelectRubric(rubric)} variant="primary" size="sm">
                  Seleccionar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
