import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import { type Evaluation, EvaluationStatus } from "../../models/evaluation.ts";
import type { Task } from "../../models/task.ts";

interface TaskEvaluationProps {
  task: Task;
  userId: string;
  userRole: string;
}

export default function TaskEvaluation({ task, userId, userRole }: TaskEvaluationProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si la tarea es un entregable
  const isDeliverable = task.isDeliverable;

  // Cargar evaluación si existe
  useEffect(() => {
    if (!isDeliverable) {
      setLoading(false);
      return;
    }

    const fetchEvaluation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar evaluaciones para este entregable
        const response = await fetch(`/api/evaluations?deliverableId=${task.id}`);

        if (!response.ok) {
          throw new Error(`Error al cargar evaluación: ${response.statusText}`);
        }

        const evaluations = await response.json();

        // Filtrar evaluaciones completadas para este estudiante
        const completedEvaluations = evaluations.filter(
          (evaluation: Evaluation) =>
            evaluation.status === EvaluationStatus.COMPLETED && evaluation.studentId === userId
        );

        if (completedEvaluations.length > 0) {
          // Tomar la evaluación más reciente
          const latestEvaluation = completedEvaluations.sort(
            (evalA: Evaluation, evalB: Evaluation) =>
              (evalB.evaluatedAt || 0) - (evalA.evaluatedAt || 0)
          )[0];

          setEvaluation(latestEvaluation);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar evaluación";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [task.id, userId, isDeliverable]);

  // Calcular porcentaje
  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };

  // Determinar color basado en porcentaje
  const getScoreColor = (percent: number) => {
    if (percent >= 90) return "text-green-600";
    if (percent >= 80) return "text-green-500";
    if (percent >= 70) return "text-yellow-600";
    if (percent >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Si no es un entregable, no mostrar nada
  if (!isDeliverable) {
    return null;
  }

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-center">
          <div class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          <p class="ml-2 text-gray-600">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <div class="mt-4 p-4 bg-red-50 rounded-lg">
        <p class="text-red-600">{error}</p>
      </div>
    );
  }

  // Si no hay evaluación, mostrar mensaje
  if (!evaluation) {
    return (
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <p class="text-gray-600">
            {task.status === "review"
              ? "Este entregable está pendiente de evaluación."
              : "Este entregable aún no ha sido evaluado."}
          </p>

          {userRole === "ADMIN" || userRole === "PRODUCT_OWNER" || userRole === "SCRUM_MASTER" ? (
            <Button
              onClick={() => (globalThis.location.href = `/deliverables/${task.id}/evaluate`)}
              size="sm"
            >
              Evaluar
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  // Si hay evaluación, mostrar resumen
  const percentage = calculatePercentage(evaluation.totalScore, evaluation.maxPossibleScore);

  return (
    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Evaluación</h3>
          {evaluation.evaluatedAt && (
            <p class="text-sm text-gray-600">
              Evaluado el {new Date(evaluation.evaluatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div class="text-right">
          <p class={`text-xl font-bold ${getScoreColor(percentage)}`}>
            {evaluation.totalScore} / {evaluation.maxPossibleScore}
          </p>
          <p class="text-sm text-gray-600">{percentage}%</p>
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
        <div class="mt-3 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800 font-medium">Retroalimentación:</p>
          <p class="text-sm text-blue-700">{evaluation.overallFeedback}</p>
        </div>
      )}

      <div class="mt-3 text-right">
        <a
          href={`/evaluations/${evaluation.id}`}
          class="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
        >
          Ver evaluación completa
          <MaterialIcon icon="arrow_forward" class="ml-1" size="sm" />
        </a>
      </div>
    </div>
  );
}
