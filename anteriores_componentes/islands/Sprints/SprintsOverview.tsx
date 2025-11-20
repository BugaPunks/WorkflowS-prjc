import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";
import type { Sprint } from "../../models/sprint.ts";
import { SprintStatus } from "../../models/sprint.ts";

interface SprintsOverviewProps {
  projects: Project[];
  sprintsByProject: Record<string, Sprint[]>;
  canManageSprints: boolean;
}

export default function SprintsOverview({
  projects,
  sprintsByProject,
  canManageSprints,
}: SprintsOverviewProps) {
  const [selectedProject, setSelectedProject] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SprintStatus | "all">("all");

  // Filtrar sprints según los criterios seleccionados
  const getFilteredSprints = () => {
    let filteredSprints: Sprint[] = [];

    // Recopilar sprints según el proyecto seleccionado
    if (selectedProject === "all") {
      // Todos los proyectos
      for (const sprints of Object.values(sprintsByProject)) {
        filteredSprints = [...filteredSprints, ...sprints];
      }
    } else {
      // Proyecto específico
      filteredSprints = sprintsByProject[selectedProject] || [];
    }

    // Filtrar por estado si es necesario
    if (statusFilter !== "all") {
      filteredSprints = filteredSprints.filter((sprint) => sprint.status === statusFilter);
    }

    return filteredSprints;
  };

  const filteredSprints = getFilteredSprints();

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Filtros */}
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex flex-col md:flex-row gap-4">
            {/* Filtro de proyecto */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="projectFilter">
                Proyecto
              </label>
              <select
                id="projectFilter"
                value={selectedProject}
                onChange={(e) => setSelectedProject((e.target as HTMLSelectElement).value)}
                class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los proyectos</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de estado */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="statusFilter">
                Estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter((e.target as HTMLSelectElement).value as SprintStatus | "all")
                }
                class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="planned">Planificado</option>
                <option value="active">En progreso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Botón para crear sprint (solo visible si se selecciona un proyecto específico) */}
          {canManageSprints && selectedProject !== "all" && (
            <Button
              href={`/projects/${selectedProject}/sprints`}
              class="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Gestionar Sprints
            </Button>
          )}
        </div>
      </div>

      {/* Lista de sprints */}
      {filteredSprints.length === 0 ? (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>No hay sprints</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay sprints disponibles</h3>
          <p class="text-gray-500 mb-4">
            {selectedProject === "all"
              ? "No se encontraron sprints con los filtros seleccionados."
              : "Este proyecto aún no tiene sprints."}
          </p>
          {canManageSprints && selectedProject !== "all" && (
            <Button
              href={`/projects/${selectedProject}/sprints`}
              class="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear Sprint
            </Button>
          )}
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSprints.map((sprint) => {
            const project = projects.find((p) => p.id === sprint.projectId);
            return (
              <div key={sprint.id} class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">
                      <a href={`/sprints/${sprint.id}`} class="hover:text-blue-600">
                        {sprint.name}
                      </a>
                    </h3>
                    {project && (
                      <p class="text-sm text-gray-600">
                        Proyecto:{" "}
                        <a href={`/projects/${project.id}`} class="text-blue-600 hover:underline">
                          {project.name}
                        </a>
                      </p>
                    )}
                  </div>
                  <span
                    class={`px-2 py-1 text-xs font-semibold rounded-full ${
                      sprint.status === SprintStatus.ACTIVE
                        ? "bg-blue-100 text-blue-800"
                        : sprint.status === SprintStatus.COMPLETED
                          ? "bg-green-100 text-green-800"
                          : sprint.status === SprintStatus.CANCELLED
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sprint.status === SprintStatus.PLANNED
                      ? "Planificado"
                      : sprint.status === SprintStatus.ACTIVE
                        ? "En progreso"
                        : sprint.status === SprintStatus.COMPLETED
                          ? "Completado"
                          : sprint.status === SprintStatus.CANCELLED
                            ? "Cancelado"
                            : sprint.status}
                  </span>
                </div>

                {sprint.goal && <p class="text-gray-700 mb-3">{sprint.goal}</p>}

                <div class="text-sm text-gray-500 mb-3">
                  {sprint.startDate && sprint.endDate ? (
                    <span>
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </span>
                  ) : (
                    <span>Sin fechas definidas</span>
                  )}
                </div>

                <div class="flex justify-end">
                  <Button
                    href={`/sprints/${sprint.id}`}
                    class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm"
                  >
                    Ver detalles
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
