import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";
import type { Sprint } from "../../models/sprint.ts";
import { SprintStatus } from "../../models/sprint.ts";

interface SprintPlanningPageProps {
  projects: Project[];
  sprintsByProject: Record<string, Sprint[]>;
}

export default function SprintPlanningPage({
  projects,
  sprintsByProject,
}: SprintPlanningPageProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedSprint, setSelectedSprint] = useState<string>("");

  // Resetear el sprint seleccionado cuando cambia el proyecto
  useEffect(() => {
    setSelectedSprint("");
  }, []);

  // Obtener sprints del proyecto seleccionado
  const sprints = selectedProject ? sprintsByProject[selectedProject] || [] : [];

  // Obtener sprint seleccionado
  const sprint = sprints.find((s) => s.id === selectedSprint);

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-6">Selecciona un proyecto y un sprint para planificar</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Selección de proyecto */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectSelect">
            Proyecto
          </label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={(e) => setSelectedProject((e.target as HTMLSelectElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de sprint */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2" htmlFor="sprintSelect">
            Sprint
          </label>
          <select
            id="sprintSelect"
            value={selectedSprint}
            onChange={(e) => setSelectedSprint((e.target as HTMLSelectElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedProject || sprints.length === 0}
          >
            <option value="">
              {!selectedProject
                ? "Primero selecciona un proyecto"
                : sprints.length === 0
                  ? "No hay sprints disponibles"
                  : "Selecciona un sprint"}
            </option>
            {sprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Información del sprint seleccionado */}
      {sprint && (
        <div class="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold mb-2">{sprint.name}</h3>

          {sprint.goal && (
            <p class="text-gray-700 mb-3">
              <span class="font-medium">Objetivo:</span> {sprint.goal}
            </p>
          )}

          <p class="text-gray-700 mb-3">
            <span class="font-medium">Estado:</span>{" "}
            {sprint.status === SprintStatus.PLANNED
              ? "Planificado"
              : sprint.status === SprintStatus.ACTIVE
                ? "En progreso"
                : sprint.status === SprintStatus.COMPLETED
                  ? "Completado"
                  : sprint.status === SprintStatus.CANCELLED
                    ? "Cancelado"
                    : sprint.status}
          </p>

          {sprint.startDate && sprint.endDate && (
            <p class="text-gray-700">
              <span class="font-medium">Fechas:</span> {formatDate(sprint.startDate)} -{" "}
              {formatDate(sprint.endDate)}
            </p>
          )}
        </div>
      )}

      {/* Acciones */}
      <div class="flex flex-wrap gap-3">
        {selectedProject && (
          <Button
            href={`/projects/${selectedProject}/sprints`}
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Gestionar Sprints
          </Button>
        )}

        {sprint && (
          <>
            <Button
              href={`/sprints/${sprint.id}`}
              class="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Ver Detalles
            </Button>

            <Button
              href={`/sprints/${sprint.id}/add-user-stories`}
              class="bg-green-600 hover:bg-green-700 text-white"
            >
              Añadir Historias de Usuario
            </Button>
          </>
        )}

        {!selectedProject && (
          <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded w-full">
            <p>Selecciona un proyecto para comenzar la planificación de sprint.</p>
          </div>
        )}

        {selectedProject && sprints.length === 0 && (
          <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded w-full">
            <p>Este proyecto no tiene sprints. Crea un sprint primero.</p>
            <div class="mt-3">
              <Button
                href={`/projects/${selectedProject}/sprints`}
                class="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear Sprint
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
