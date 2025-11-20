import { UserStoryPriority } from "../../models/userStory.ts";

interface BacklogFiltersProps {
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export default function BacklogFilters({
  priorityFilter,
  onPriorityFilterChange,
  searchQuery,
  onSearchQueryChange,
}: BacklogFiltersProps) {
  return (
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.currentTarget.value)}
            class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todas las prioridades</option>
            <option value={UserStoryPriority.CRITICAL}>Crítica</option>
            <option value={UserStoryPriority.HIGH}>Alta</option>
            <option value={UserStoryPriority.MEDIUM}>Media</option>
            <option value={UserStoryPriority.LOW}>Baja</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.currentTarget.value)}
            placeholder="Buscar historias..."
            class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
