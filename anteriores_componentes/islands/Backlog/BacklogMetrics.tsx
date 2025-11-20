import { type UserStory, UserStoryPriority } from "../../models/userStory.ts";

interface BacklogMetricsProps {
  backlogItems: UserStory[];
}

export default function BacklogMetrics({ backlogItems }: BacklogMetricsProps) {
  // Calcular métricas
  const totalItems = backlogItems.length;
  const criticalItems = backlogItems.filter(
    (item) => item.priority === UserStoryPriority.CRITICAL
  ).length;
  const highItems = backlogItems.filter((item) => item.priority === UserStoryPriority.HIGH).length;
  const mediumItems = backlogItems.filter(
    (item) => item.priority === UserStoryPriority.MEDIUM
  ).length;
  const lowItems = backlogItems.filter((item) => item.priority === UserStoryPriority.LOW).length;

  // Calcular puntos totales estimados
  const totalPoints = backlogItems.reduce((sum, item) => sum + (item.points || 0), 0);

  // Calcular porcentajes
  const criticalPercentage = totalItems > 0 ? (criticalItems / totalItems) * 100 : 0;
  const highPercentage = totalItems > 0 ? (highItems / totalItems) * 100 : 0;
  const mediumPercentage = totalItems > 0 ? (mediumItems / totalItems) * 100 : 0;
  const lowPercentage = totalItems > 0 ? (lowItems / totalItems) * 100 : 0;

  return (
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Métricas del Backlog</h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-gray-700">
            Total de historias: <span class="font-bold">{totalItems}</span>
          </p>
          <p class="text-sm font-medium text-gray-700">
            Puntos estimados: <span class="font-bold">{totalPoints}</span>
          </p>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Distribución por prioridad</h3>

          {/* Barra de progreso para prioridad crítica */}
          <div class="mb-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-red-800">Crítica</span>
              <span class="text-xs font-medium text-red-800">
                {criticalItems} ({criticalPercentage.toFixed(1)}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-red-500 h-2 rounded-full"
                style={{ width: `${criticalPercentage}%` }}
              />
            </div>
          </div>

          {/* Barra de progreso para prioridad alta */}
          <div class="mb-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-orange-800">Alta</span>
              <span class="text-xs font-medium text-orange-800">
                {highItems} ({highPercentage.toFixed(1)}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style={{ width: `${highPercentage}%` }} />
            </div>
          </div>

          {/* Barra de progreso para prioridad media */}
          <div class="mb-2">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-yellow-800">Media</span>
              <span class="text-xs font-medium text-yellow-800">
                {mediumItems} ({mediumPercentage.toFixed(1)}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${mediumPercentage}%` }}
              />
            </div>
          </div>

          {/* Barra de progreso para prioridad baja */}
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-green-800">Baja</span>
              <span class="text-xs font-medium text-green-800">
                {lowItems} ({lowPercentage.toFixed(1)}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" style={{ width: `${lowPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
