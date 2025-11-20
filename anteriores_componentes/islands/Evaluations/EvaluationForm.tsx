import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import type { Deliverable } from "../../models/deliverable.ts";
import {
  type CriterionEvaluation,
  type Evaluation,
  EvaluationStatus,
} from "../../models/evaluation.ts";
import type { Rubric, RubricCriterion } from "../../models/rubric.ts";

interface EvaluationFormProps {
  deliverable: Deliverable;
  rubric: Rubric;
  existingEvaluation?: Evaluation;
  studentId: string;
  onSave: (evaluation: Evaluation) => void;
  onCancel: () => void;
}

export default function EvaluationForm({
  deliverable,
  rubric,
  existingEvaluation,
  studentId,
  onSave,
  onCancel,
}: EvaluationFormProps) {
  // Estado para la evaluación
  const [criteriaEvaluations, setCriteriaEvaluations] = useState<CriterionEvaluation[]>([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [_evaluationStatus, setEvaluationStatus] = useState<EvaluationStatus>(
    EvaluationStatus.DRAFT
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular puntuaciones
  const [totalScore, setTotalScore] = useState(0);
  const maxPossibleScore = rubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0);

  // Inicializar con evaluación existente o crear nueva
  useEffect(() => {
    if (existingEvaluation) {
      setCriteriaEvaluations(existingEvaluation.criteriaEvaluations);
      setOverallFeedback(existingEvaluation.overallFeedback || "");
      setEvaluationStatus(existingEvaluation.status);
    } else {
      // Crear evaluaciones vacías para cada criterio
      const initialEvaluations = rubric.criteria.map((criterion) => ({
        criterionId: criterion.id || "",
        score: 0,
        feedback: "",
      }));
      setCriteriaEvaluations(initialEvaluations);
    }
  }, [existingEvaluation, rubric]);

  // Actualizar puntuación total cuando cambian las evaluaciones
  useEffect(() => {
    const newTotalScore = criteriaEvaluations.reduce((sum, evalItem) => sum + evalItem.score, 0);
    setTotalScore(newTotalScore);
  }, [criteriaEvaluations]);

  // Manejar cambio en la puntuación de un criterio
  const handleScoreChange = (criterionId: string | undefined, score: number) => {
    if (!criterionId) return;

    setCriteriaEvaluations((prev) =>
      prev.map((evalItem) =>
        evalItem.criterionId === criterionId ? { ...evalItem, score } : evalItem
      )
    );
  };

  // Manejar cambio en la retroalimentación de un criterio
  const handleFeedbackChange = (criterionId: string | undefined, feedback: string) => {
    if (!criterionId) return;

    setCriteriaEvaluations((prev) =>
      prev.map((evalItem) =>
        evalItem.criterionId === criterionId ? { ...evalItem, feedback } : evalItem
      )
    );
  };

  // Obtener criterio por ID
  const getCriterionById = (criterionId: string): RubricCriterion | undefined => {
    return rubric.criteria.find((c) => c.id === criterionId);
  };

  // Guardar evaluación
  const handleSave = async (finalStatus: EvaluationStatus) => {
    setSaving(true);
    setError(null);

    try {
      const evaluationData = {
        deliverableId: deliverable.id,
        studentId,
        rubricId: rubric.id,
        criteriaEvaluations,
        overallFeedback,
        totalScore,
        maxPossibleScore,
        status: finalStatus,
      };

      const url = existingEvaluation
        ? `/api/evaluations/${existingEvaluation.id}`
        : "/api/evaluations";

      const method = existingEvaluation ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error al guardar la evaluación: ${response.statusText}`
        );
      }

      const savedEvaluation = await response.json();
      onSave(savedEvaluation);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar la evaluación";
      setError(errorMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Finalizar evaluación
  const handleFinalize = async () => {
    // Verificar que todos los criterios tienen puntuación
    const hasAllScores = criteriaEvaluations.every((evalItem) => evalItem.score > 0);

    if (!hasAllScores) {
      setError(
        "Debes asignar una puntuación a todos los criterios antes de finalizar la evaluación."
      );
      return;
    }

    await handleSave(EvaluationStatus.COMPLETED);
  };

  // Guardar como borrador
  const handleSaveAsDraft = async () => {
    await handleSave(EvaluationStatus.DRAFT);
  };

  // Renderizar nivel de criterio
  const renderCriterionLevel = (criterion: RubricCriterion, criterionEval: CriterionEvaluation) => {
    return (
      <div class="mt-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Niveles de desempeño:</h4>
        <div class="space-y-2">
          {criterion.levels.map((level) => (
            <div
              key={level.id}
              class={`p-3 rounded-lg border cursor-pointer transition-colors ${
                criterionEval.score === level.pointValue
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => handleScoreChange(criterion.id || "", level.pointValue)}
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <div
                    class={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                      criterionEval.score === level.pointValue
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {criterionEval.score === level.pointValue && (
                      <MaterialIcon icon="check" size="sm" />
                    )}
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{level.pointValue} puntos</p>
                    <p class="text-sm text-gray-600">{level.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Evaluación de Entregable</h2>
          <p class="text-gray-600 mt-1">
            Evaluando: <span class="font-medium">{deliverable.title}</span>
          </p>
          <p class="text-gray-600">
            Usando rúbrica: <span class="font-medium">{rubric.name}</span>
          </p>
        </div>

        <div class="text-right">
          <p class="text-lg font-bold text-gray-900">
            Puntuación: {totalScore} / {maxPossibleScore}
          </p>
          <p class="text-gray-600 text-sm">{Math.round((totalScore / maxPossibleScore) * 100)}%</p>
        </div>
      </div>

      {error && <div class="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Criterios de Evaluación</h3>

        <div class="space-y-6">
          {criteriaEvaluations.map((criterionEval) => {
            const criterion = getCriterionById(criterionEval.criterionId);

            if (!criterion) return null;

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
                    <p class="text-lg font-bold text-gray-900">
                      {criterionEval.score} / {criterion.maxPoints}
                    </p>
                  </div>
                </div>

                {renderCriterionLevel(criterion, criterionEval)}

                <div class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Retroalimentación específica:
                  </label>
                  <textarea
                    value={criterionEval.feedback || ""}
                    onChange={(e: Event) =>
                      handleFeedbackChange(criterion.id, (e.target as HTMLTextAreaElement).value)
                    }
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Proporciona retroalimentación específica para este criterio..."
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div class="mb-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Retroalimentación General
          </label>
          <textarea
            value={overallFeedback}
            onChange={(e: Event) => setOverallFeedback((e.target as HTMLTextAreaElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Proporciona una retroalimentación general sobre el entregable..."
          />
        </div>
      </div>

      <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <div class="flex space-x-2 ml-2">
          <Button type="button" variant="ghost" onClick={handleSaveAsDraft} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Borrador"}
          </Button>
          <Button type="button" variant="primary" onClick={handleFinalize} disabled={saving}>
            {saving ? "Finalizando..." : "Finalizar Evaluación"}
          </Button>
        </div>
      </div>
    </div>
  );
}
