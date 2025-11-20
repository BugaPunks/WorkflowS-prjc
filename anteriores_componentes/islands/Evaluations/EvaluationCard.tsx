import { useEffect, useState } from "preact/hooks";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import type { Deliverable } from "../../models/deliverable.ts";
import type { Evaluation } from "../../models/evaluation.ts";

interface EvaluationCardProps {
  evaluation: Evaluation;
  onClick?: () => void;
}

export default function EvaluationCard({ evaluation, onClick }: EvaluationCardProps) {
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del entregable
  useEffect(() => {
    const fetchDeliverable = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/deliverables/${evaluation.deliverableId}`);

        if (!response.ok) {
          throw new Error(`Error al cargar el entregable: ${response.statusText}`);
        }

        const data = await response.json();
        setDeliverable(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar el entregable";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverable();
  }, [evaluation.deliverableId]);

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Calcular porcentaje
  const percentage = Math.round((evaluation.totalScore / evaluation.maxPossibleScore) * 100);

  // Determinar color basado en porcentaje
  const getScoreColor = (percent: number) => {
    if (percent >= 90) return "text-green-600";
    if (percent >= 80) return "text-green-500";
    if (percent >= 70) return "text-yellow-600";
    if (percent >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Determinar color de fondo basado en porcentaje
  const getScoreBackgroundColor = (percent: number) => {
    if (percent >= 90) return "bg-green-100";
    if (percent >= 80) return "bg-green-50";
    if (percent >= 70) return "bg-yellow-50";
    if (percent >= 60) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <div
      class={`border rounded-lg shadow-sm overflow-hidden ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${getScoreBackgroundColor(percentage)}`}
      onClick={onClick}
    >
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div>
            {loading ? (
              <div class="h-6 w-40 bg-gray-200 animate-pulse rounded" />
            ) : error ? (
              <h3 class="text-lg font-medium text-gray-900">Error al cargar entregable</h3>
            ) : deliverable ? (
              <h3 class="text-lg font-medium text-gray-900">{deliverable.title}</h3>
            ) : (
              <h3 class="text-lg font-medium text-gray-900">
                Entregable #{evaluation.deliverableId}
              </h3>
            )}

            {evaluation.evaluatedAt && (
              <p class="text-sm text-gray-600 mt-1">
                Evaluado el {formatDate(evaluation.evaluatedAt)}
              </p>
            )}
          </div>

          <div class="text-right">
            <div class={`text-xl font-bold ${getScoreColor(percentage)}`}>
              {evaluation.totalScore} / {evaluation.maxPossibleScore}
            </div>
            <div class="text-sm text-gray-600">{percentage}%</div>
          </div>
        </div>

        <div class="mt-3">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class={`h-2 rounded-full ${
                percentage >= 90
                  ? "bg-green-600"
                  : percentage >= 80
                    ? "bg-green-500"
                    : percentage >= 70
                      ? "bg-yellow-600"
                      : percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {evaluation.overallFeedback && (
          <div class="mt-3 text-sm text-gray-700">
            <p class="line-clamp-2">{evaluation.overallFeedback}</p>
          </div>
        )}

        <div class="mt-3 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            {evaluation.criteriaEvaluations.length} criterios evaluados
          </div>

          {onClick && (
            <div class="text-blue-600 flex items-center text-sm">
              <span>Ver detalles</span>
              <MaterialIcon icon="arrow_forward" class="ml-1" size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
