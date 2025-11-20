import { Button } from "../components/Button.tsx";

interface ProjectsHeaderProps {
  isAdmin: boolean;
  onCreateProject: () => void;
}

export default function ProjectsHeader({ isAdmin, onCreateProject }: ProjectsHeaderProps) {
  return (
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Proyectos</h1>
      <div class="flex space-x-2">
        {isAdmin && (
          <Button
            onClick={onCreateProject}
            class="bg-green-600 hover:bg-green-700 text-gray-600 hover:text-white font-bold py-2 px-4 rounded flex items-center"
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
            Crear Proyecto
          </Button>
        )}
        <a
          href="/welcome"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors border border-blue-700"
        >
          Volver al Inicio
        </a>
      </div>
    </div>
  );
}
