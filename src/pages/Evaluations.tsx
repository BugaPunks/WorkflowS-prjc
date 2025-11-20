import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/hooks/useSession';

interface Task {
  id: string;
  title: string;
  status: string;
  projectId: string; // Added for fetching rubrics
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    name: string;
  };
  evaluations: Evaluation[];
}

interface Evaluation {
  id: string;
  score: number;
  feedback: string;
  evaluatorId: string;
}

interface Criteria {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
}

interface Rubric {
  id: string;
  name: string;
  criteria: Criteria[];
}

export default function Evaluations() {
  const { session: user } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [availableRubrics, setAvailableRubrics] = useState<Rubric[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);

  // State for form
  const [evalForm, setEvalForm] = useState({
    feedback: '',
  });
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>(
    {},
  );

  const loadTasks = useCallback(async (_userId: string) => {
    try {
      setIsLoading(true);
      // Fetch tasks that are COMPLETED
      const response = await fetch('/api/tasks');
      const data = await response.json();
      const allTasks = data.data || data || []; // Handle both {data: []} and []
      const completedTasks = allTasks.filter(
        (t: Task) => t.status === 'COMPLETED',
      );
      setTasks(completedTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRubrics = async (projectId: string) => {
    try {
      const response = await fetch(`/api/rubrics/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRubrics(data.data || []);
      }
    } catch (error) {
      console.error('Error loading rubrics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Only allow teachers/admins to see this page
      loadTasks(user.id);
    }
  }, [user, loadTasks]);

  useEffect(() => {
    if (selectedTask) {
      loadRubrics(selectedTask.projectId);
      setCriteriaScores({});
      setEvalForm({ feedback: '' });
      setSelectedRubric(null);
    }
  }, [selectedTask]);

  // Auto-select first rubric if available
  useEffect(() => {
    if (availableRubrics.length > 0 && !selectedRubric) {
      setSelectedRubric(availableRubrics[0]);
    }
  }, [availableRubrics, selectedRubric]);

  // Initialize scores when rubric changes
  useEffect(() => {
    if (selectedRubric) {
      const initialScores: Record<string, number> = {};
      selectedRubric.criteria.forEach((c) => {
        initialScores[c.id] = c.maxScore; // Default to max score
      });
      setCriteriaScores(initialScores);
    }
  }, [selectedRubric]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-gray-600">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Restringido
        </h1>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  const calculateTotalScore = () => {
    if (!selectedRubric) return 100;

    let totalWeight = 0;
    let weightedSum = 0;

    selectedRubric.criteria.forEach((c) => {
      const score = criteriaScores[c.id] || 0;
      weightedSum += (score / c.maxScore) * c.weight;
      totalWeight += c.weight;
    });

    if (totalWeight === 0) return 0;
    // Normalize to 0-100
    return Math.round((weightedSum / totalWeight) * 100);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !user || !selectedRubric) return;

    try {
      const finalScore = calculateTotalScore();
      const scoresPayload = Object.entries(criteriaScores).map(
        ([id, score]) => ({
          criteriaId: id,
          score,
        }),
      );

      const response = await fetch(`/api/tasks/${selectedTask.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          feedback: evalForm.feedback,
          evaluatorId: user.id,
          criteriaScores: scoresPayload,
        }),
      });

      if (!response.ok) throw new Error('Error al evaluar');

      setSelectedTask(null);
      setEvalForm({ feedback: '' });
      setCriteriaScores({});
      loadTasks(user.id);
      alert('Evaluación guardada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar la evaluación');
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluaciones</h1>
      <p className="text-gray-600 mb-8">
        Califica las tareas completadas por los estudiantes usando Rúbricas.
      </p>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Tareas Completadas
            </h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 italic">
                No hay tareas completadas pendientes de revisión.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTask?.id === task.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{task.title}</h3>
                      <p className="text-sm text-gray-600">
                        {task.project.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Asignado a: {task.assignee?.name || 'Sin asignar'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {task.evaluations && task.evaluations.length > 0 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Evaluada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSelectTask(task)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Evaluar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            {selectedTask ? (
              <form onSubmit={handleEvaluate}>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Evaluar Tarea
                </h2>
                <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <h3 className="font-semibold">{selectedTask.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTask.project.name}
                  </p>
                </div>

                {/* Rubric Selection */}
                {availableRubrics.length > 0 ? (
                  <div className="mb-6">
                    <label
                      htmlFor="rubric-select"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Seleccionar Rúbrica
                    </label>
                    <select
                      id="rubric-select"
                      className="w-full border rounded px-3 py-2"
                      value={selectedRubric?.id || ''}
                      onChange={(e) => {
                        const rubric = availableRubrics.find(
                          (r) => r.id === e.target.value,
                        );
                        setSelectedRubric(rubric || null);
                      }}
                    >
                      {availableRubrics.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded text-sm">
                    No hay rúbricas definidas para este proyecto.
                    {/* In future: Add button to create one */}
                  </div>
                )}

                {/* Criteria Inputs */}
                {selectedRubric && (
                  <div className="space-y-4 mb-6 border-t pt-4">
                    <h3 className="font-semibold text-gray-700">Criterios</h3>
                    {selectedRubric.criteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <label
                            htmlFor={`crit-${criterion.id}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {criterion.name}{' '}
                            <span className="text-gray-400 text-xs">
                              (Max: {criterion.maxScore}, Peso:{' '}
                              {criterion.weight})
                            </span>
                          </label>
                        </div>
                        <input
                          id={`crit-${criterion.id}`}
                          type="number"
                          min="0"
                          max={criterion.maxScore}
                          value={criteriaScores[criterion.id] || 0}
                          onChange={(e) => {
                            const val = Math.min(
                              Number(e.target.value),
                              criterion.maxScore,
                            );
                            setCriteriaScores((prev) => ({
                              ...prev,
                              [criterion.id]: val,
                            }));
                          }}
                          className="w-20 border rounded px-2 py-1 text-right"
                        />
                      </div>
                    ))}

                    <div className="bg-gray-100 p-3 rounded flex justify-between items-center font-bold text-gray-800 mt-4">
                      <span>Nota Final Calculada:</span>
                      <span className="text-xl">
                        {calculateTotalScore()} / 100
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label
                    htmlFor="eval-feedback"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Feedback General
                  </label>
                  <textarea
                    id="eval-feedback"
                    rows={4}
                    value={evalForm.feedback}
                    onChange={(e) =>
                      setEvalForm({ ...evalForm, feedback: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Comentarios generales..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedRubric && availableRubrics.length > 0}
                    className={`flex-1 px-4 py-2 text-white rounded-lg ${!selectedRubric && availableRubrics.length > 0 ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Guardar Evaluación
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Selecciona una tarea para evaluarla.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
