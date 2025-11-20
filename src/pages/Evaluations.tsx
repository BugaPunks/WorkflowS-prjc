import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/AppShell';

interface Task {
  id: string;
  title: string;
  status: string;
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Evaluations() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [evalForm, setEvalForm] = useState({ score: 100, feedback: '' });

  const loadTasks = useCallback(async (_userId: string) => {
    try {
      setIsLoading(true);
      // Fetch tasks that are COMPLETED
      const response = await fetch('/api/tasks');
      const data = await response.json();
      const allTasks = data.data || [];
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    // Only allow teachers/admins to see this page?
    // For now, let everyone see but only Teachers can evaluate?
    // Based on requirements: "Docente... evaluar entregables"
    loadTasks(parsedUser.id);
  }, [navigate, loadTasks]);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !user) return;

    try {
      // This endpoint needs to be created
      const response = await fetch(`/api/tasks/${selectedTask.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Number(evalForm.score),
          feedback: evalForm.feedback,
          evaluatorId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Error al evaluar');

      setSelectedTask(null);
      setEvalForm({ score: 100, feedback: '' });
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
    <AppShell user={user || undefined}>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluaciones</h1>
        <p className="text-gray-600 mb-8">
          Califica las tareas completadas por los estudiantes.
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
                        <h3 className="font-bold text-gray-800">
                          {task.title}
                        </h3>
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

                  <div className="mb-4">
                    <label
                      htmlFor="eval-score"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Calificación (0-100)
                    </label>
                    <input
                      id="eval-score"
                      type="number"
                      min="0"
                      max="100"
                      value={evalForm.score}
                      onChange={(e) =>
                        setEvalForm({
                          ...evalForm,
                          score: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="eval-feedback"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Feedback
                    </label>
                    <textarea
                      id="eval-feedback"
                      rows={4}
                      value={evalForm.feedback}
                      onChange={(e) =>
                        setEvalForm({ ...evalForm, feedback: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Comentarios para el estudiante..."
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
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    </AppShell>
  );
}
