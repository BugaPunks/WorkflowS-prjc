import { useState } from "preact/hooks";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import type { UserStory } from "../../models/userStory.ts";
import FilteredTasksList from "./FilteredTasksList.tsx";
import TaskFilters from "./TaskFilters.tsx";
import type { TaskFiltersState } from "./TaskFilters.tsx";
import type { GroupingOption } from "./TaskGrouping.tsx";
import TaskViewSelector from "./TaskViewSelector.tsx";
import type { ViewType } from "./TaskViewSelector.tsx";
import WorkloadSummary from "./WorkloadSummary.tsx";

interface MyTasksListProps {
  initialTasks: Task[];
  projects: Record<string, Project>;
  userStories: Record<string, UserStory>;
}

export default function MyTasksList({ initialTasks, projects, userStories }: MyTasksListProps) {
  // Estado para las tareas
  const [tasks] = useState<Task[]>(initialTasks);

  // Estado para filtros, agrupación y vista
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: "all",
    projectId: "",
    sprintId: "",
    searchTerm: "",
    priority: "all",
  });

  const [grouping, setGrouping] = useState<GroupingOption>("status");
  const [view, setView] = useState<ViewType>("cards");

  // Manejar cambios en los filtros
  const handleFilterChange = (newFilters: TaskFiltersState) => {
    setFilters(newFilters);
  };

  // Manejar cambios en la agrupación
  const handleGroupingChange = (newGrouping: GroupingOption) => {
    setGrouping(newGrouping);
  };

  // Manejar cambios en la vista
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  return (
    <div class="space-y-6">
      {/* Componente de filtros */}
      <TaskFilters
        projects={projects}
        userStories={userStories}
        initialFilters={filters}
        onFilterChange={handleFilterChange}
        onGroupingChange={handleGroupingChange}
        initialGrouping={grouping}
      />

      {/* Selector de vista */}
      <div class="flex justify-end">
        <TaskViewSelector initialView={view} onViewChange={handleViewChange} />
      </div>

      {/* Lista de tareas filtradas y agrupadas */}
      <div class="w-full">
        <FilteredTasksList
          tasks={tasks}
          projects={projects}
          userStories={userStories}
          filters={filters}
          grouping={grouping}
          view={view}
        />
      </div>

      {/* Resumen de carga de trabajo - Ahora en la parte inferior */}
      <WorkloadSummary tasks={tasks} projects={projects} userStories={userStories} />
    </div>
  );
}
