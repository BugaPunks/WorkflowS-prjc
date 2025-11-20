import { useEffect, useState } from "preact/hooks";
import { type Evaluation, EvaluationStatus } from "../../models/evaluation.ts";
import EvaluationCard from "./EvaluationCard.tsx";

interface StudentEvaluationsListProps {
  studentId: string;
  onSelectEvaluation?: (evaluation: Evaluation) => void;
}

export default function StudentEvaluationsList({
  studentId,
  onSelectEvaluation,
}: StudentEvaluationsListProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

        setEvaluations(completedEvaluations);
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

  // Filtrar evaluaciones
  const filteredEvaluations = evaluations.filter((evaluation) => {
    // Aquí necesitaríamos el título del entregable, pero no lo tenemos en la evaluación
    // Por ahora, filtramos por ID, pero idealmente deberíamos cargar los datos del entregable
    return evaluation.deliverableId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Mis Evaluaciones</h2>
        </div>

        <div class="mb-4">
          <input
            type="text"
            placeholder="Buscar evaluaciones..."
            value={searchTerm}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
      ) : filteredEvaluations.length === 0 ? (
        <div class="p-8 text-center text-gray-500">
          <p>No tienes evaluaciones completadas.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredEvaluations.map((evaluation) => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onClick={() => onSelectEvaluation?.(evaluation)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
