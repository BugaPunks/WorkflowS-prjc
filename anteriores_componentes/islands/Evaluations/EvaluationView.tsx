import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Deliverable } from "../../models/deliverable.ts";
import type { Evaluation } from "../../models/evaluation.ts";
import type { Rubric, RubricCriterion } from "../../models/rubric.ts";

interface EvaluationViewProps {
  evaluationId: string;
  onBack?: () => void;
  onEdit?: (evaluation: Evaluation) => void;
}

export default function EvaluationView({ evaluationId, onBack, onEdit }: EvaluationViewProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar evaluación y datos relacionados
  useEffect(() => {
    const fetchEvaluation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar evaluación
        const evalResponse = await fetch(`/api/evaluations/${evaluationId}`);

        if (!evalResponse.ok) {
          throw new Error(`Error al cargar la evaluación: ${evalResponse.statusText}`);
        }

        const evalData = await evalResponse.json();
        setEvaluation(evalData);

        // Cargar rúbrica
        const rubricResponse = await fetch(`/api/rubrics/${evalData.rubricId}`);

        if (!rubricResponse.ok) {
          throw new Error(`Error al cargar la rúbrica: ${rubricResponse.statusText}`);
        }

        const rubricData = await rubricResponse.json();
        setRubric(rubricData);

        // Cargar entregable (usando el endpoint de tareas ya que los entregables son tareas)
        const deliverableResponse = await fetch(`/api/tasks/${evalData.deliverableId}`);

        if (!deliverableResponse.ok) {
          throw new Error(`Error al cargar el entregable: ${deliverableResponse.statusText}`);
        }

        const deliverableData = await deliverableResponse.json();
        // El API de tareas devuelve { task }, extraer la tarea
        const task = deliverableData.task || deliverableData;
        setDeliverable(task);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar la evaluación";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId]);

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Obtener criterio por ID
  const getCriterionById = (criterionId: string): RubricCriterion | undefined => {
    return rubric?.criteria.find((c) => c.id === criterionId);
  };

  // Obtener nivel de criterio por puntuación
  const getCriterionLevelByScore = (criterion: RubricCriterion, score: number) => {
    return criterion.levels.find((level) => level.pointValue === score);
  };

  if (loading) {
    return (
      <div class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p class="mt-2 text-gray-600">Cargando evaluación...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!evaluation || !rubric || !deliverable) {
    return (
      <div class="p-8 text-center text-gray-500">
        <p>No se encontró la evaluación o datos relacionados.</p>
        {onBack && (
          <button type="button" onClick={onBack} class="mt-2 text-blue-600 hover:underline">
            Volver
          </button>
        )}
      </div>
    );
  }

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

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            {onBack && (
              <button type="button" onClick={onBack} class="text-gray-500 hover:text-gray-700">
                ← Volver
              </button>
            )}
            <h2 class="text-2xl font-bold text-gray-900">Evaluación de Entregable</h2>
          </div>
          <p class="text-gray-600">
            Entregable: <span class="font-medium">{deliverable.title}</span>
          </p>
          <p class="text-gray-600">
            Rúbrica: <span class="font-medium">{rubric.name}</span>
          </p>
          {evaluation.evaluatedAt && (
            <p class="text-gray-600 text-sm mt-1">
              Evaluado el {formatDate(evaluation.evaluatedAt)}
            </p>
          )}
        </div>

        <div class="text-right">
          <div class="flex items-center justify-end mb-1">
            <span class={`text-2xl font-bold ${getScoreColor(percentage)}`}>
              {evaluation.totalScore} / {evaluation.maxPossibleScore}
            </span>
            {onEdit && (
              <Button onClick={() => onEdit(evaluation)} variant="ghost" size="sm" class="ml-4">
                Editar
              </Button>
            )}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class={`h-2.5 rounded-full ${
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
          <p class="text-gray-600 text-sm mt-1">{percentage}%</p>
        </div>
      </div>

      {evaluation.overallFeedback && (
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">Retroalimentación General</h3>
          <p class="text-blue-700">{evaluation.overallFeedback}</p>
        </div>
      )}

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Criterios Evaluados</h3>

        <div class="space-y-6">
          {evaluation.criteriaEvaluations.map((criterionEval) => {
            const criterion = getCriterionById(criterionEval.criterionId);

            if (!criterion) return null;

            const level = getCriterionLevelByScore(criterion, criterionEval.score);

            return (
              <div key={criterion.id} class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{criterion.name}</h3>
                    {criterion.description && (
                      <p class="mt-1 text-sm text-gray-600">{criterion.description}</p>
                    )}
                  </div>
                  <div class="text-right">
                    <p
                      class={`text-lg font-bold ${getScoreColor((criterionEval.score / criterion.maxPoints) * 100)}`}
                    >
                      {criterionEval.score} / {criterion.maxPoints}
                    </p>
                  </div>
                </div>

                {level && (
                  <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-700 mb-1">Nivel de desempeño:</h4>
                    <p class="text-gray-800">{level.description}</p>
                  </div>
                )}

                {criterionEval.feedback && (
                  <div class="mt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-1">
                      Retroalimentación específica:
                    </h4>
                    <p class="text-gray-800 p-3 bg-gray-50 rounded-lg">{criterionEval.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        {onBack && (
          <Button onClick={onBack} variant="default">
            Volver
          </Button>
        )}

        {onEdit && <Button onClick={() => onEdit(evaluation)}>Editar Evaluación</Button>}
      </div>
    </div>
  );
}
