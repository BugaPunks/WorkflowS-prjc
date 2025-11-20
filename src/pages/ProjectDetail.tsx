import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '@/components/AppShell';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, _setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Proyecto no encontrado');
      const data = await response.json();
      setProject(data.data);
    } catch (err) {
      setError('Error al cargar el proyecto');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    loadProject();
  }, [navigate, loadProject]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sprintForm,
          projectId: id,
        }),
      });
      if (!response.ok) throw new Error('Error al crear sprint');
      setSprintForm({ name: '', description: '', startDate: '', endDate: '' });
      setShowSprintModal(false);
      // Reload project to get updated sprints
      loadProject();
    } catch (err) {
      setError('Error al crear el sprint');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <AppShell user={user || undefined}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Cargando proyecto...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell user={user || undefined}>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Proyecto no encontrado'}
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Volver a Proyectos
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user || undefined}>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Volver a Proyectos
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {project.status || 'ACTIVO'}
                </span>
                <span className="text-sm text-gray-500">
                  Creado el {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Sprints</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">Sprints creados</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Tareas</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">Tareas totales</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Historias</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-2">Historias de usuario</p>
          </div>
        </div>

        {/* Sprints Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sprints del Proyecto
            </h2>
            <button
              type="button"
              onClick={() => setShowSprintModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              + Nuevo Sprint
            </button>
          </div>

          {sprints.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-5xl mb-4">🏃</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay sprints
              </h3>
              <p className="text-gray-600 mb-6">
                Crea tu primer sprint para este proyecto
              </p>
              <button
                type="button"
                onClick={() => setShowSprintModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Crear Sprint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {sprint.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                    {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    {sprint.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sprint Modal */}
        {showSprintModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nuevo Sprint
              </h3>
              <form onSubmit={handleCreateSprint}>
                <div className="mb-4">
                  <label
                    htmlFor="sprint-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre
                  </label>
                  <input
                    id="sprint-name"
                    type="text"
                    value={sprintForm.name}
                    onChange={(e) =>
                      setSprintForm({ ...sprintForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sprint 1"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="sprint-desc"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="sprint-desc"
                    value={sprintForm.description}
                    onChange={(e) =>
                      setSprintForm({
                        ...sprintForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del sprint"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="sprint-start"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Inicio
                  </label>
                  <input
                    id="sprint-start"
                    type="date"
                    value={sprintForm.startDate}
                    onChange={(e) =>
                      setSprintForm({
                        ...sprintForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="sprint-end"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fin
                  </label>
                  <input
                    id="sprint-end"
                    type="date"
                    value={sprintForm.endDate}
                    onChange={(e) =>
                      setSprintForm({ ...sprintForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSprintModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
