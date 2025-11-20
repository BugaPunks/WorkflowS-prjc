import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { type Rubric, RubricStatus } from "../../models/rubric.ts";

interface RubricsListProps {
  projectId?: string;
  templatesOnly?: boolean;
  onSelectRubric?: (rubric: Rubric) => void;
  onCreateRubric?: () => void;
  onEditRubric?: (rubric: Rubric) => void;
  onDeleteRubric?: (rubric: Rubric) => void;
  onDuplicateRubric?: (rubric: Rubric) => void;
}

export default function RubricsList({
  projectId,
  templatesOnly = false,
  onSelectRubric,
  onCreateRubric,
  onEditRubric,
  onDeleteRubric,
  onDuplicateRubric,
}: RubricsListProps) {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RubricStatus | "all">("all");

  // Cargar rúbricas
  useEffect(() => {
    const fetchRubrics = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "/api/rubrics";
        const params = new URLSearchParams();

        if (templatesOnly) {
          params.append("template", "true");
        }

        if (projectId) {
          params.append("projectId", projectId);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error al cargar rúbricas: ${response.statusText}`);
        }

        const data = await response.json();
        setRubrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar rúbricas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRubrics();
  }, [projectId, templatesOnly]);

  // Filtrar rúbricas
  const filteredRubrics = rubrics.filter((rubric) => {
    const matchesSearch =
      rubric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rubric.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || rubric.status === statusFilter;

    return matchesSearch && matchesStatus;
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
          <h2 class="text-lg font-semibold text-gray-800">
            {templatesOnly ? "Plantillas de Rúbricas" : "Rúbricas"}
          </h2>
          {onCreateRubric && <Button onClick={onCreateRubric}>Nueva Rúbrica</Button>}
        </div>

        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Buscar rúbricas..."
              value={searchTerm}
              onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target as HTMLSelectElement).value as RubricStatus | "all")
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value={RubricStatus.DRAFT}>Borrador</option>
              <option value={RubricStatus.ACTIVE}>Activa</option>
              <option value={RubricStatus.ARCHIVED}>Archivada</option>
            </select>
          </div>
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
          <p>No se encontraron rúbricas.</p>
          {onCreateRubric && (
            <button type="button" onClick={onCreateRubric} class="mt-2 text-blue-600 hover:underline">
              Crear una nueva rúbrica
            </button>
          )}
        </div>
      ) : (
        <ul class="divide-y divide-gray-200">
          {filteredRubrics.map((rubric) => (
            <li key={rubric.id} class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3
                      class="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                      onClick={() => onSelectRubric?.(rubric)}
                    >
                      {rubric.name}
                    </h3>
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
                    {rubric.criteria.length} criterios • Creada el{" "}
                    {new Date(rubric.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div class="flex gap-2">
                  {onEditRubric && (
                    <button
                      type="button"
                      onClick={() => onEditRubric(rubric)}
                      class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                  )}
                  {onDuplicateRubric && (
                    <button
                      type="button"
                      onClick={() => onDuplicateRubric(rubric)}
                      class="text-sm text-green-600 hover:text-green-800"
                    >
                      Duplicar
                    </button>
                  )}
                  {onDeleteRubric && (
                    <button
                      type="button"
                      onClick={() => onDeleteRubric(rubric)}
                      class="text-sm text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
