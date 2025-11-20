import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";

interface BacklogHeaderProps {
  projectId?: string;
  currentProject: Project | null;
  projects: Project[];
  onCreateUserStory: () => void;
  isProductOwner: boolean;
  isAdmin: boolean;
}

export default function BacklogHeader({
  projectId,
  currentProject,
  projects,
  onCreateUserStory,
  isProductOwner,
  isAdmin,
}: BacklogHeaderProps) {
  // Función para cambiar de proyecto
  const handleProjectChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const value = select.value;

    if (value === "") {
      globalThis.location.href = "/backlog";
    } else {
      globalThis.location.href = `/backlog?projectId=${value}`;
    }
  };

  return (
    <div class="mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Product Backlog</h1>
          {currentProject && <p class="text-gray-600 mt-1">Proyecto: {currentProject.name}</p>}
        </div>
        <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0">
          {(isProductOwner || isAdmin) && (
            <Button
              onClick={onCreateUserStory}
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Crear Historia
            </Button>
          )}
          <a
            href={projectId ? `/projects/${projectId}` : "/projects"}
            class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors border border-blue-700"
          >
            Volver a Proyectos
          </a>
        </div>
      </div>

      <div class="bg-white shadow-md rounded-lg p-4 mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div class="mb-4 md:mb-0">
            <h2 class="text-lg font-semibold text-gray-800">Gestión del Backlog</h2>
            <p class="text-gray-600">
              Organiza y prioriza las historias de usuario para maximizar el valor del producto.
            </p>
          </div>
          <div class="w-full md:w-64">
            <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Proyecto</label>
            <select
              value={projectId || ""}
              onChange={handleProjectChange}
              class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos los proyectos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
