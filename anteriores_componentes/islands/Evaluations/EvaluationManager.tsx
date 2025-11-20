import { useState } from "preact/hooks";
import type { Deliverable } from "../../models/deliverable.ts";
import type { Evaluation } from "../../models/evaluation.ts";
import type { Rubric } from "../../models/rubric.ts";
import { UserRole } from "../../models/user.ts";
import DeliverableDetails from "./DeliverableDetails.tsx";
import EvaluationForm from "./EvaluationForm.tsx";
import EvaluationStats from "./EvaluationStats.tsx";
import EvaluationView from "./EvaluationView.tsx";
import PendingDeliverablesList from "./PendingDeliverablesList.tsx";
import RubricSelector from "./RubricSelector.tsx";

interface EvaluationManagerProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projectId?: string;
  deliverableId?: string;
  evaluationId?: string;
}

type ViewState =
  | "list"
  | "deliverable-details"
  | "select-rubric"
  | "create-evaluation"
  | "view-evaluation";

export default function EvaluationManager({
  session,
  projectId,
  deliverableId: initialDeliverableId,
  evaluationId: initialEvaluationId,
}: EvaluationManagerProps) {
  // Estado para controlar la vista actual
  const [viewState, setViewState] = useState<ViewState>(
    initialEvaluationId ? "view-evaluation" : initialDeliverableId ? "deliverable-details" : "list"
  );

  // Estado para almacenar datos seleccionados
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | undefined>(undefined);
  const [evaluationId, setEvaluationId] = useState<string | undefined>(initialEvaluationId);

  // Determinar si el usuario puede evaluar
  const canEvaluate =
    session.role === UserRole.ADMIN ||
    session.role === UserRole.PRODUCT_OWNER ||
    session.role === UserRole.SCRUM_MASTER;

  // Manejar la selección de un entregable
  const handleSelectDeliverable = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setViewState("deliverable-details");
  };

  // Manejar el inicio de evaluación
  const handleStartEvaluation = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setViewState("select-rubric");
  };

  // Manejar la selección de una rúbrica
  const handleSelectRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setViewState("create-evaluation");
  };

  // Manejar la finalización de la evaluación
  const handleEvaluationComplete = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setEvaluationId(evaluation.id);
    setViewState("view-evaluation");
  };

  // Manejar la edición de una evaluación
  const handleEditEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setSelectedDeliverable(null); // Cargaremos el entregable desde la API
    setSelectedRubric(null); // Cargaremos la rúbrica desde la API
    setViewState("create-evaluation");
  };

  // Manejar el botón de volver
  const handleBack = () => {
    switch (viewState) {
      case "deliverable-details":
        setViewState("list");
        setSelectedDeliverable(null);
        break;
      case "select-rubric":
        setViewState("deliverable-details");
        break;
      case "create-evaluation":
        setViewState("select-rubric");
        setSelectedRubric(null);
        break;
      case "view-evaluation":
        setViewState("list");
        setSelectedEvaluation(undefined);
        setSelectedDeliverable(null);
        setSelectedRubric(null);
        setEvaluationId(undefined);
        break;
      default:
        setViewState("list");
    }
  };

  // Renderizar la vista actual
  const renderView = () => {
    switch (viewState) {
      case "deliverable-details":
        if (!selectedDeliverable && !initialDeliverableId) return null;
        return (
          <DeliverableDetails
            deliverableId={selectedDeliverable?.id || initialDeliverableId!}
            onBack={handleBack}
            onEvaluate={canEvaluate ? handleStartEvaluation : undefined}
          />
        );

      case "select-rubric":
        if (!selectedDeliverable) return null;
        return (
          <RubricSelector
            projectId={projectId}
            onSelectRubric={handleSelectRubric}
            onCancel={handleBack}
          />
        );

      case "create-evaluation":
        if ((!selectedDeliverable || !selectedRubric) && !selectedEvaluation) return null;
        return (
          <EvaluationForm
            deliverable={selectedDeliverable!}
            rubric={selectedRubric!}
            existingEvaluation={selectedEvaluation}
            studentId={selectedDeliverable?.assignedTo || ""}
            onSave={handleEvaluationComplete}
            onCancel={handleBack}
          />
        );

      case "view-evaluation":
        if (!evaluationId) return null;
        return (
          <EvaluationView
            evaluationId={evaluationId}
            onBack={handleBack}
            onEdit={canEvaluate ? handleEditEvaluation : undefined}
          />
        );
      default:
        return (
          <div class="space-y-6">
            {canEvaluate && <EvaluationStats projectId={projectId} />}

            <PendingDeliverablesList
              projectId={projectId}
              onSelectDeliverable={handleSelectDeliverable}
            />
          </div>
        );
    }
  };

  return <div>{renderView()}</div>;
}
