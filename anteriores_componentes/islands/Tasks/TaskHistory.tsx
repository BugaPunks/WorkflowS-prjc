import { useEffect, useState } from "preact/hooks";
import type { TaskHistoryEntry } from "../../models/task.ts";
import { TaskHistoryType } from "../../models/task.ts";
import { getUserById } from "../../services/userService.ts";

interface TaskHistoryProps {
  taskId: string;
}

export default function TaskHistory({ taskId }: TaskHistoryProps) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<
    Record<string, { firstName?: string; lastName?: string; username: string }>
  >({});
  const [filter, setFilter] = useState<TaskHistoryType | "all">("all");

  // Cargar historial
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/tasks/${taskId}/history`);

        if (!response.ok) {
          throw new Error("Error al cargar historial");
        }

        const data = await response.json();
        setHistory(data.history);

        // Cargar información de usuarios
        const userIds = new Set(data.history.map((entry: TaskHistoryEntry) => entry.userId));
        const users: Record<string, { firstName?: string; lastName?: string; username: string }> =
          {};

        for (const userId of userIds) {
          try {
            const user = await getUserById(userId as string);
            if (user) {
              users[userId as string] = {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
              };
            }
          } catch (error) {
            console.error(`Error al cargar usuario ${userId}:`, error);
          }
        }

        setUserCache(users);
      } catch (err) {
        setError("No se pudo cargar el historial. Por favor, intenta de nuevo.");
        console.error("Error cargando historial:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [taskId]);

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener nombre de usuario
  const getUserName = (userId: string) => {
    const user = userCache[userId];
    if (!user) return userId;

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.username;
  };

  // Obtener icono según el tipo de cambio
  const getTypeIcon = (type: TaskHistoryType) => {
    switch (type) {
      case TaskHistoryType.STATUS_CHANGE:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Cambio de estado</title>
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        );
      case TaskHistoryType.ASSIGNMENT:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-purple-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Asignación de tarea</title>
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      case TaskHistoryType.TIME_LOGGED:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Registro de tiempo</title>
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
        );
      case TaskHistoryType.COMMENT_ADDED:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-yellow-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Comentario añadido</title>
            <path
              fill-rule="evenodd"
              d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
              clip-rule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Cambio de campo</title>
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        );
    }
  };

  // Obtener texto legible del tipo de cambio
  const getTypeText = (type: TaskHistoryType) => {
    switch (type) {
      case TaskHistoryType.STATUS_CHANGE:
        return "Cambio de estado";
      case TaskHistoryType.ASSIGNMENT:
        return "Asignación";
      case TaskHistoryType.TIME_LOGGED:
        return "Registro de tiempo";
      case TaskHistoryType.COMMENT_ADDED:
        return "Comentario";
      case TaskHistoryType.FIELD_CHANGE:
        return "Cambio de campo";
      default:
        return type;
    }
  };

  // Filtrar historial
  const filteredHistory =
    filter === "all" ? history : history.filter((entry) => entry.type === filter);

  return (
    <div class="mt-6 bg-white rounded-lg shadow-md p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Historial de cambios</h3>

        {/* Filtros */}
        <div class="flex items-center">
          <span class="text-sm text-gray-600 mr-2">Filtrar:</span>
          <select
            value={filter}
            onChange={(e) =>
              setFilter((e.target as HTMLSelectElement).value as TaskHistoryType | "all")
            }
            class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos</option>
            <option value={TaskHistoryType.STATUS_CHANGE}>Estado</option>
            <option value={TaskHistoryType.ASSIGNMENT}>Asignación</option>
            <option value={TaskHistoryType.TIME_LOGGED}>Tiempo</option>
            <option value={TaskHistoryType.COMMENT_ADDED}>Comentarios</option>
            <option value={TaskHistoryType.FIELD_CHANGE}>Otros cambios</option>
          </select>
        </div>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div class="text-center py-8 text-gray-500">
          {filter === "all"
            ? "No hay registros de actividad para esta tarea."
            : `No hay registros de tipo "${getTypeText(filter as TaskHistoryType)}" para esta tarea.`}
        </div>
      ) : (
        <div class="space-y-4">
          {filteredHistory.map((entry) => (
            <div key={entry.id} class="border-b border-gray-200 pb-4 last:border-0">
              <div class="flex items-start">
                <div class="mr-3 mt-1">{getTypeIcon(entry.type)}</div>
                <div class="flex-grow">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="font-medium">{getUserName(entry.userId)}</span>
                      <span class="text-gray-600 text-sm ml-2">{getTypeText(entry.type)}</span>
                    </div>
                    <span class="text-sm text-gray-500">{formatDate(entry.createdAt)}</span>
                  </div>

                  {entry.description ? (
                    <p class="text-gray-700 mt-1">{entry.description}</p>
                  ) : (
                    <div class="mt-1 text-sm">
                      <span class="text-gray-600">Campo: </span>
                      <span class="font-medium">{entry.field}</span>
                      {entry.oldValue && (
                        <>
                          <span class="text-gray-600 ml-2">De: </span>
                          <span class="font-medium">{entry.oldValue}</span>
                        </>
                      )}
                      {entry.newValue && (
                        <>
                          <span class="text-gray-600 ml-2">A: </span>
                          <span class="font-medium">{entry.newValue}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
