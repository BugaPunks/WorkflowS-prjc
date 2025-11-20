import { useEffect, useState } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Sprint } from "../../models/sprint.ts";
import { TaskStatus } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";
import { getProjectSprints } from "../../services/sprintService.ts";
import type { GroupingOption } from "./TaskGrouping.tsx";

export interface TaskFiltersState {
  status: TaskStatus | "all";
  projectId: string;
  sprintId: string;
  searchTerm: string;
  priority: "all" | "low" | "medium" | "high" | "critical";
}

interface TaskFiltersProps {
  projects: Record<string, Project>;
  userStories: Record<string, UserStory>;
  initialFilters: TaskFiltersState;
  onFilterChange: (filters: TaskFiltersState) => void;
  initialGrouping?: GroupingOption;
  onGroupingChange?: (grouping: GroupingOption) => void;
}

export default function TaskFilters({
  projects,
  userStories: _userStories, // Prefijo con _ para indicar que no se usa directamente
  initialFilters,
  onFilterChange,
  initialGrouping = "status",
  onGroupingChange = () => {}, // Valor por defecto para evitar errores
}: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFiltersState>(initialFilters);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [activeGrouping, setActiveGrouping] = useState<GroupingOption>(initialGrouping);

  // Cargar sprints cuando cambia el proyecto seleccionado
  useEffect(() => {
    const loadSprints = async () => {
      if (!filters.projectId) {
        setSprints([]);
        return;
      }

      setIsLoadingSprints(true);
      try {
        const projectSprints = await getProjectSprints(filters.projectId);
        setSprints(projectSprints);
      } catch (error) {
        console.error("Error al cargar sprints:", error);
      } finally {
        setIsLoadingSprints(false);
      }
    };

    loadSprints();
  }, [filters.projectId]);

  // Actualizar filtros y notificar al componente padre
  const handleFilterChange = (name: keyof TaskFiltersState, value: string) => {
    // Si cambiamos de proyecto, resetear el sprint seleccionado
    if (name === "projectId") {
      const newFilters = {
        ...filters,
        [name]: value,
        sprintId: "",
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      const newFilters = {
        ...filters,
        [name]: value,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    const defaultFilters: TaskFiltersState = {
      status: "all",
      projectId: "",
      sprintId: "",
      searchTerm: "",
      priority: "all",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Manejar cambio de agrupación
  const handleGroupingChange = (option: GroupingOption) => {
    setActiveGrouping(option);
    onGroupingChange(option);
  };

  // Definir opciones de agrupación con sus etiquetas
  const groupingOptions: { value: GroupingOption; label: string; icon: string }[] = [
    { value: "status", label: "Estado", icon: "📊" },
    { value: "project", label: "Proyecto", icon: "📁" },
    { value: "userStory", label: "Historia de Usuario", icon: "📝" },
    { value: "priority", label: "Prioridad", icon: "🔥" },
    { value: "dueDate", label: "Fecha límite", icon: "📅" },
    { value: "none", label: "Sin agrupar", icon: "📋" },
  ];

  return (
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Filtros</h2>
        <div class="flex space-x-2">
          <button
            type="button"
            onClick={() => setExpandedFilters(!expandedFilters)}
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {expandedFilters ? "Menos filtros" : "Más filtros"}
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            class="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por estado */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="status-filter">
            Estado
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", (e.target as HTMLSelectElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value={TaskStatus.TODO}>Por hacer</option>
            <option value={TaskStatus.IN_PROGRESS}>En progreso</option>
            <option value={TaskStatus.REVIEW}>En revisión</option>
            <option value={TaskStatus.DONE}>Completadas</option>
            <option value={TaskStatus.BLOCKED}>Bloqueadas</option>
          </select>
        </div>

        {/* Filtro por proyecto */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="project-filter">
            Proyecto
          </label>
          <select
            id="project-filter"
            value={filters.projectId}
            onChange={(e) => handleFilterChange("projectId", (e.target as HTMLSelectElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los proyectos</option>
            {Object.values(projects).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por sprint */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="sprint-filter">
            Sprint
          </label>
          <select
            id="sprint-filter"
            value={filters.sprintId}
            onChange={(e) => handleFilterChange("sprintId", (e.target as HTMLSelectElement).value)}
            disabled={!filters.projectId || isLoadingSprints}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Todos los sprints</option>
            {isLoadingSprints ? (
              <option value="" disabled>
                Cargando sprints...
              </option>
            ) : (
              sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Búsqueda por texto */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="search-filter">
            Buscar
          </label>
          <input
            type="text"
            id="search-filter"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", (e.target as HTMLInputElement).value)}
            placeholder="Buscar en tareas..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Opciones de agrupación */}
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="mb-2">
          <h3 class="text-sm font-medium text-gray-700">Agrupar por:</h3>
        </div>
        <div class="flex flex-wrap gap-2">
          {groupingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleGroupingChange(option.value)}
              class={`flex items-center px-3 py-2 rounded-md text-sm ${
                activeGrouping === option.value
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <span class="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros expandidos */}
      {expandedFilters && (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          {/* Filtro por prioridad */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="priority-filter">
              Prioridad
            </label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) =>
                handleFilterChange("priority", (e.target as HTMLSelectElement).value)
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          {/* Aquí se pueden añadir más filtros en el futuro */}
        </div>
      )}
    </div>
  );
}
