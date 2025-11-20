import { useEffect, useState } from "preact/hooks";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import { type Evaluation, EvaluationStatus } from "../../models/evaluation.ts";
import EvaluationCard from "./EvaluationCard.tsx";

interface EvaluationHistoryProps {
  studentId: string;
  onSelectEvaluation?: (evaluation: Evaluation) => void;
}

export default function EvaluationHistory({
  studentId,
  onSelectEvaluation,
}: EvaluationHistoryProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
  });

  // Cargar evaluaciones del estudiante
  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/evaluations?studentId=${studentId}`);

        if (!response.ok) {
          throw new Error(`Error al cargar evaluaciones: ${response.statusText}`);
        }

        const data = await response.json();

        // Filtrar solo evaluaciones completadas
        const completedEvaluations = data.filter(
          (evaluation: Evaluation) => evaluation.status === EvaluationStatus.COMPLETED
        );

        // Ordenar por fecha de evaluación (más reciente primero)
        completedEvaluations.sort((evalA: Evaluation, evalB: Evaluation) => {
          return (evalB.evaluatedAt || 0) - (evalA.evaluatedAt || 0);
        });

        setEvaluations(completedEvaluations);

        // Calcular estadísticas
        if (completedEvaluations.length > 0) {
          let totalPercentage = 0;
          let highest = 0;
          let lowest = 100;

          completedEvaluations.forEach((evaluation: Evaluation) => {
            const percentage = Math.round(
              (evaluation.totalScore / evaluation.maxPossibleScore) * 100
            );
            totalPercentage += percentage;
            highest = Math.max(highest, percentage);
            lowest = Math.min(lowest, percentage);
          });

          setStats({
            totalEvaluations: completedEvaluations.length,
            averageScore: Math.round(totalPercentage / completedEvaluations.length),
            highestScore: highest,
            lowestScore: lowest,
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar evaluaciones";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [studentId]);

  // Determinar color basado en porcentaje
  const getScoreColor = (percent: number) => {
    if (percent >= 90) return "text-green-600";
    if (percent >= 80) return "text-green-500";
    if (percent >= 70) return "text-yellow-600";
    if (percent >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div class="space-y-6">
      {/* Estadísticas */}
      {!loading && !error && evaluations.length > 0 && (
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Resumen de Evaluaciones</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-blue-700">Total de Evaluaciones</p>
                  <p class="text-2xl font-bold text-blue-800">{stats.totalEvaluations}</p>
                </div>
                <MaterialIcon icon="assignment" class="text-blue-500" size="3xl" />
              </div>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-green-700">Promedio</p>
                  <p class={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore}%
                  </p>
                </div>
                <MaterialIcon icon="analytics" class="text-green-500" size="3xl" />
              </div>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-purple-700">Calificación más alta</p>
                  <p class={`text-2xl font-bold ${getScoreColor(stats.highestScore)}`}>
                    {stats.highestScore}%
                  </p>
                </div>
                <MaterialIcon icon="trending_up" class="text-purple-500" size="3xl" />
              </div>
            </div>

            <div class="bg-amber-50 p-4 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-amber-700">Calificación más baja</p>
                  <p class={`text-2xl font-bold ${getScoreColor(stats.lowestScore)}`}>
                    {stats.lowestScore}%
                  </p>
                </div>
                <MaterialIcon icon="trending_down" class="text-amber-500" size="3xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de evaluaciones */}
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">Historial de Evaluaciones</h2>
        </div>

        {loading ? (
          <div class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <p class="mt-2 text-gray-600">Cargando evaluaciones...</p>
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
        ) : evaluations.length === 0 ? (
          <div class="p-8 text-center text-gray-500">
            <p>No tienes evaluaciones completadas.</p>
          </div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {evaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onClick={() => onSelectEvaluation?.(evaluation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
