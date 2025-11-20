import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '@/api/client';
import AppShell from '@/components/AppShell';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const loadProjects = useCallback(async (userId?: string) => {
    try {
      setIsLoading(true);
      const projectsData = await projectAPI.getAll({
        memberId: userId,
      });
      setProjects((projectsData as Project[]) || []);
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error(err);
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
    loadProjects(parsedUser.id);
  }, [navigate, loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const projectData = {
        name: formData.name,
        description: formData.description,
        ownerId: user.id, // Añadir el ID del usuario actual como ownerId
      };

      // Usar el cliente API para manejar correctamente la respuesta y errores
      await projectAPI.create(projectData);
      setFormData({ name: '', description: '' });
      setShowModal(false);
      if (user) await loadProjects(user.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear el proyecto',
      );
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?'))
      return;
    try {
      await projectAPI.delete(id);
      if (user) await loadProjects(user.id);
    } catch (err) {
      setError('Error al eliminar el proyecto');
      console.error(err);
    }
  };

  const canCreateProject = user?.role === 'ADMIN';

  return (
    <AppShell user={user || undefined}>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Proyectos</h2>
            <p className="text-gray-600 mt-2">
              Gestiona tus proyectos y colabora con tu equipo
            </p>
          </div>
          {canCreateProject && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              + Nuevo Proyecto
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Cargando proyectos...</p>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {project.status || 'ACTIVO'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{project.description}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 font-medium text-sm"
                  >
                    Ver
                  </button>
                  {canCreateProject && (
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 font-medium text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay proyectos
            </h3>
            <p className="text-gray-600 mb-6">
              {canCreateProject
                ? 'Crea tu primer proyecto para comenzar'
                : 'No estás asignado a ningún proyecto'}
            </p>
            {canCreateProject && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Crear Proyecto
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && canCreateProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Crear Nuevo Proyecto
              </h3>
              <form onSubmit={handleCreateProject}>
                <div className="mb-4">
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del proyecto"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="project-desc"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="project-desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del proyecto"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
