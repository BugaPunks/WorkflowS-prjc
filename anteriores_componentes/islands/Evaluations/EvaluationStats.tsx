import { useEffect, useState } from "preact/hooks";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import { type Evaluation, EvaluationStatus } from "../../models/evaluation.ts";

interface EvaluationStatsProps {
  projectId?: string;
}

interface StatsData {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export default function EvaluationStats({ projectId }: EvaluationStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalEvaluations: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener todas las evaluaciones
        let url = "/api/evaluations";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error al cargar evaluaciones: ${response.statusText}`);
        }

        const evaluations = await response.json();

        // Calcular estadísticas
        const completed = evaluations.filter(
          (evaluation: Evaluation) => evaluation.status === EvaluationStatus.COMPLETED
        );

        const pending = evaluations.filter(
          (evaluation: Evaluation) => evaluation.status === EvaluationStatus.DRAFT
        );

        let totalPercentage = 0;
        let highest = 0;
        let lowest = 100;

        if (completed.length > 0) {
          completed.forEach((evaluation: Evaluation) => {
            const percentage = Math.round(
              (evaluation.totalScore / evaluation.maxPossibleScore) * 100
            );
            totalPercentage += percentage;
            highest = Math.max(highest, percentage);
            lowest = Math.min(lowest, percentage);
          });
        }

        setStats({
          totalEvaluations: evaluations.length,
          completedEvaluations: completed.length,
          pendingEvaluations: pending.length,
          averageScore: completed.length > 0 ? Math.round(totalPercentage / completed.length) : 0,
          highestScore: highest,
          lowestScore: completed.length > 0 ? lowest : 0,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar estadísticas";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  // Determinar color basado en porcentaje
  const getScoreColor = (percent: number) => {
    if (percent >= 90) return "text-green-600";
    if (percent >= 80) return "text-green-500";
    if (percent >= 70) return "text-yellow-600";
    if (percent >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-center items-center h-40">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <p class="ml-2 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-center text-red-600 p-4">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="mt-2 text-blue-600 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        Estadísticas de Evaluaciones
        {projectId && <span class="text-sm text-gray-500 ml-2">para el proyecto seleccionado</span>}
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <p class="text-sm text-green-700">Evaluaciones Completadas</p>
              <p class="text-2xl font-bold text-green-800">{stats.completedEvaluations}</p>
            </div>
            <MaterialIcon icon="check_circle" class="text-green-500" size="3xl" />
          </div>
        </div>

        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-yellow-700">Evaluaciones Pendientes</p>
              <p class="text-2xl font-bold text-yellow-800">{stats.pendingEvaluations}</p>
            </div>
            <MaterialIcon icon="pending" class="text-yellow-500" size="3xl" />
          </div>
        </div>
      </div>

      {stats.completedEvaluations > 0 && (
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-indigo-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-indigo-700">Promedio</p>
                <p class={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
              </div>
              <MaterialIcon icon="analytics" class="text-indigo-500" size="3xl" />
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
      )}
    </div>
  );
}
