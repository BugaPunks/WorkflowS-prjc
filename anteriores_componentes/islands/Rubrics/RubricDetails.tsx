import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { type Rubric, type RubricCriterion, RubricStatus } from "../../models/rubric.ts";

interface RubricDetailsProps {
  rubricId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

export default function RubricDetails({ rubricId, onEdit, onBack }: RubricDetailsProps) {
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalles de la rúbrica
  useEffect(() => {
    const fetchRubric = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/rubrics/${rubricId}`);

        if (!response.ok) {
          throw new Error(`Error al cargar la rúbrica: ${response.statusText}`);
        }

        const data = await response.json();
        setRubric(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la rúbrica");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRubric();
  }, [rubricId]);

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

  // Renderizar criterio
  const renderCriterion = (criterion: RubricCriterion, index: number) => {
    return (
      <div key={criterion.id} class="mb-6 bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-gray-900">
              {index + 1}. {criterion.name}
            </h3>
            {criterion.description && (
              <p class="mt-1 text-sm text-gray-600">{criterion.description}</p>
            )}
          </div>
          <div class="text-sm font-medium text-gray-700">Máximo: {criterion.maxPoints} puntos</div>
        </div>

        <div class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Niveles de desempeño:</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nivel
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Descripción
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {criterion.levels.map((level, levelIndex) => (
                  <tr key={level.id}>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Nivel {levelIndex + 1}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">{level.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.pointValue} puntos
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p class="mt-2 text-gray-600">Cargando rúbrica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="p-4 text-center text-red-600">
        <p>{error}</p>
        <button type="button" onClick={() => globalThis.location.reload()} class="mt-2 text-blue-600 hover:underline">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!rubric) {
    return (
      <div class="p-8 text-center text-gray-500">
        <p>No se encontró la rúbrica.</p>
        {onBack && (
          <button type="button" onClick={onBack} class="mt-2 text-blue-600 hover:underline">
            Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <div class="bg-gray-50 p-6 rounded-lg">
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            {onBack && (
              <button type="button" onClick={onBack} class="text-gray-500 hover:text-gray-700">
                ← Volver
              </button>
            )}
            <h2 class="text-2xl font-bold text-gray-900">{rubric.name}</h2>
            {renderStatus(rubric.status)}
            {rubric.isTemplate && (
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Plantilla
              </span>
            )}
          </div>
          {rubric.description && <p class="text-gray-600">{rubric.description}</p>}
          <p class="mt-1 text-sm text-gray-500">
            Creada el {new Date(rubric.createdAt).toLocaleDateString()}
            {rubric.updatedAt &&
              rubric.updatedAt !== rubric.createdAt &&
              ` • Actualizada el ${new Date(rubric.updatedAt).toLocaleDateString()}`}
          </p>
        </div>

        {onEdit && <Button onClick={onEdit}>Editar Rúbrica</Button>}
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Criterios de Evaluación</h3>
        {rubric.criteria.length === 0 ? (
          <p class="text-gray-500">Esta rúbrica no tiene criterios definidos.</p>
        ) : (
          <div class="space-y-4">
            {rubric.criteria.map((criterion, index) => renderCriterion(criterion, index))}
          </div>
        )}
      </div>

      <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 class="text-md font-semibold text-blue-800 mb-2">Información de uso</h3>
        <p class="text-sm text-blue-700">
          Esta rúbrica contiene {rubric.criteria.length} criterios con un total de{" "}
          {rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0)} puntos
          posibles.
        </p>
      </div>
    </div>
  );
}
