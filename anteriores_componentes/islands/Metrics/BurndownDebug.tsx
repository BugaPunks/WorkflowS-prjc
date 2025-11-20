import { useEffect, useState } from "preact/hooks";

interface BurndownDebugProps {
  sprintId: string;
}

interface DebugInfo {
  sprint: {
    id: string;
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
    duration: number;
    daysSinceStart: number;
  };
  userStories: {
    total: number;
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    stories: Array<{
      id: string;
      title: string;
      status: string;
      points: number;
      createdAt: string;
      updatedAt: string;
    }>;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    byStory: Array<{
      storyId: string;
      storyTitle: string;
      tasks: Array<{
        id: string;
        title: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>;
  };
  burndownCalculation: {
    totalStoryPoints: number;
    idealBurndownPerDay: number;
    idealRemainingToday: number;
    actualRemainingPoints: number;
    progressPercentage: number;
  };
  timestamps: {
    now: string;
    sprintStart?: string;
    sprintEnd?: string;
  };
}

export default function BurndownDebug({ sprintId }: BurndownDebugProps) {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sprints/${sprintId}/burndown-debug`, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al cargar información de debug: ${response.status} - ${errorData.error || 'Error desconocido'}`);
      }

      const data = await response.json();
      setDebugInfo(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar debug info:", err);
      setError("No se pudo cargar la información de debug");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, [sprintId]);

  if (loading) {
    return (
      <div class="bg-gray-50 p-4 rounded-lg border">
        <h4 class="text-md font-semibold mb-2">Información de Debug</h4>
        <div class="animate-pulse">Cargando información de debug...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 p-4 rounded-lg border border-red-200">
        <h4 class="text-md font-semibold mb-2 text-red-800">Error de Debug</h4>
        <div class="text-red-600">{error}</div>
      </div>
    );
  }

  if (!debugInfo) {
    return null;
  }

  const { sprint, userStories, tasks, burndownCalculation, timestamps: _timestamps } = debugInfo;

  // Validaciones para detectar problemas
  const validations = [];
  
  if (!sprint.startDate) {
    validations.push({ type: 'warning', message: 'El sprint no tiene fecha de inicio definida' });
  }
  
  if (!sprint.endDate) {
    validations.push({ type: 'warning', message: 'El sprint no tiene fecha de fin definida' });
  }
  
  if (userStories.total === 0) {
    validations.push({ type: 'error', message: 'No hay historias de usuario asignadas al sprint' });
  }
  
  if (userStories.totalPoints === 0) {
    validations.push({ type: 'warning', message: 'Las historias de usuario no tienen puntos asignados' });
  }
  
  if (tasks.total === 0) {
    validations.push({ type: 'warning', message: 'No hay tareas creadas para las historias de usuario' });
  }

  const progressDifference = Math.abs(burndownCalculation.idealRemainingToday - burndownCalculation.actualRemainingPoints);
  if (progressDifference > burndownCalculation.totalStoryPoints * 0.2) {
    validations.push({ 
      type: 'info', 
      message: `Gran diferencia entre progreso ideal y real (${progressDifference.toFixed(1)} puntos)` 
    });
  }

  return (
    <div class="bg-gray-50 p-4 rounded-lg border">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-md font-semibold">Información de Debug del Burndown</h4>
        <div class="space-x-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            class="text-sm text-blue-500 hover:text-blue-700"
          >
            {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          <button
            type="button"
            onClick={loadDebugInfo}
            class="text-sm text-green-500 hover:text-green-700"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Validaciones */}
      {validations.length > 0 && (
        <div class="mb-4">
          <h5 class="text-sm font-semibold mb-2">Validaciones:</h5>
          <div class="space-y-1">
            {validations.map((validation, index) => (
              <div
                key={index}
                class={`text-xs p-2 rounded ${
                  validation.type === 'error' ? 'bg-red-100 text-red-700' :
                  validation.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}
              >
                <strong>{validation.type.toUpperCase()}:</strong> {validation.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen rápido */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="bg-white p-3 rounded border">
          <div class="text-xs text-gray-500">Historias de Usuario</div>
          <div class="text-lg font-semibold">{userStories.total}</div>
          <div class="text-xs text-gray-600">{userStories.totalPoints} puntos</div>
        </div>
        <div class="bg-white p-3 rounded border">
          <div class="text-xs text-gray-500">Progreso</div>
          <div class="text-lg font-semibold">{burndownCalculation.progressPercentage.toFixed(1)}%</div>
          <div class="text-xs text-gray-600">{userStories.completedPoints}/{userStories.totalPoints} puntos</div>
        </div>
        <div class="bg-white p-3 rounded border">
          <div class="text-xs text-gray-500">Tareas</div>
          <div class="text-lg font-semibold">{tasks.completed}/{tasks.total}</div>
          <div class="text-xs text-gray-600">completadas</div>
        </div>
        <div class="bg-white p-3 rounded border">
          <div class="text-xs text-gray-500">Días transcurridos</div>
          <div class="text-lg font-semibold">{sprint.daysSinceStart}</div>
          <div class="text-xs text-gray-600">de {sprint.duration} días</div>
        </div>
      </div>

      {/* Comparación ideal vs real */}
      <div class="bg-white p-3 rounded border mb-4">
        <h5 class="text-sm font-semibold mb-2">Comparación Ideal vs Real</h5>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Puntos restantes (Ideal)</div>
            <div class="text-lg font-semibold text-blue-600">{burndownCalculation.idealRemainingToday.toFixed(1)}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Puntos restantes (Real)</div>
            <div class="text-lg font-semibold text-green-600">{burndownCalculation.actualRemainingPoints}</div>
          </div>
        </div>
        <div class="mt-2 text-xs">
          <span class={`font-semibold ${
            burndownCalculation.actualRemainingPoints < burndownCalculation.idealRemainingToday 
              ? 'text-green-600' : 'text-red-600'
          }`}>
            {burndownCalculation.actualRemainingPoints < burndownCalculation.idealRemainingToday 
              ? 'Por delante del cronograma' : 'Por detrás del cronograma'}
          </span>
           por {Math.abs(burndownCalculation.idealRemainingToday - burndownCalculation.actualRemainingPoints).toFixed(1)} puntos
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div class="space-y-4">
          <div class="bg-white p-3 rounded border">
            <h5 class="text-sm font-semibold mb-2">Información del Sprint</h5>
            <div class="text-xs space-y-1">
              <div><strong>ID:</strong> {sprint.id}</div>
              <div><strong>Nombre:</strong> {sprint.name}</div>
              <div><strong>Estado:</strong> {sprint.status}</div>
              <div><strong>Inicio:</strong> {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'No definido'}</div>
              <div><strong>Fin:</strong> {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'No definido'}</div>
              <div><strong>Duración:</strong> {sprint.duration} días</div>
            </div>
          </div>

          <div class="bg-white p-3 rounded border">
            <h5 class="text-sm font-semibold mb-2">Historias de Usuario</h5>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              {userStories.stories.map((story) => (
                <div key={story.id} class="text-xs border-l-2 border-gray-200 pl-2">
                  <div class="font-semibold">{story.title}</div>
                  <div class="text-gray-600">
                    Estado: {story.status} | Puntos: {story.points}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div class="bg-white p-3 rounded border">
            <h5 class="text-sm font-semibold mb-2">Distribución de Tareas</h5>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              {tasks.byStory.map((storyTasks) => (
                <div key={storyTasks.storyId} class="text-xs border-l-2 border-blue-200 pl-2">
                  <div class="font-semibold">{storyTasks.storyTitle}</div>
                  <div class="text-gray-600">
                    {storyTasks.tasks.length} tareas: {storyTasks.tasks.filter(t => t.status === 'done').length} completadas
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
