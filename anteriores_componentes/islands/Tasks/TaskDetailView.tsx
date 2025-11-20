import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import type { User } from "../../models/user.ts";
import type { UserStory } from "../../models/userStory.ts";
import { logTaskTime } from "../../services/taskDetailService.ts";
import { updateTask } from "../../services/taskService.ts";
import Modal from "../Modal.tsx";
import EditTaskForm from "./EditTaskForm.tsx";
import TaskComments from "./TaskComments.tsx";
import TaskEvaluation from "./TaskEvaluation.tsx";
import TaskHistory from "./TaskHistory.tsx";

interface TaskDetailViewProps {
  task: Task;
  userStory: UserStory;
  project: Project;
  assignedUser: User | null;
  createdByUser: User | null;
  canManageTask: boolean;
}

export default function TaskDetailView({
  task,
  userStory,
  project,
  assignedUser,
  createdByUser,
  canManageTask,
}: TaskDetailViewProps) {
  // Estados para la tarea
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estado para la sesión actual
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Obtener el ID y rol del usuario actual
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await fetch("/api/session");
        if (response.ok) {
          const data = await response.json();
          if (data.user?.id) {
            setCurrentUserId(data.user.id);
          }
          if (data.user?.role) {
            setCurrentUserRole(data.user.role);
          }
        }
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
      }
    };

    getUserInfo();
  }, []);

  // No necesitamos estados para historial ya que ahora usamos un componente separado

  // Estados para registro de tiempo
  const [timeToLog, setTimeToLog] = useState("");
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  // Estado general
  const [error, setError] = useState<string | null>(null);

  // Función para cambiar el estado de la tarea
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdatingStatus(true);
    setError(null);

    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      if (updatedTask) {
        setCurrentTask(updatedTask);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el estado de la tarea");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Función para registrar tiempo
  const handleLogTime = async (e: Event) => {
    e.preventDefault();

    const hours = Number.parseFloat(timeToLog);
    if (Number.isNaN(hours) || hours <= 0) {
      setError("Por favor, ingresa un número válido de horas");
      return;
    }

    setIsLoggingTime(true);
    setError(null);

    try {
      const updatedTask = await logTaskTime(task.id, hours);
      if (updatedTask) {
        setCurrentTask(updatedTask);
        setTimeToLog("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar tiempo");
    } finally {
      setIsLoggingTime(false);
    }
  };

  // Función para actualizar la tarea después de editar
  const handleTaskUpdated = (updatedTask?: Task) => {
    if (updatedTask) {
      setCurrentTask(updatedTask);
    }
    setShowEditModal(false);
  };

  // Obtener texto del estado
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "Por hacer";
      case TaskStatus.IN_PROGRESS:
        return "En progreso";
      case TaskStatus.REVIEW:
        return "En revisión";
      case TaskStatus.DONE:
        return "Completada";
      case TaskStatus.BLOCKED:
        return "Bloqueada";
      default:
        return status;
    }
  };

  // Obtener color según el estado
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return "bg-gray-100 text-gray-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case TaskStatus.DONE:
        return "bg-green-100 text-green-800";
      case TaskStatus.BLOCKED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Contenido principal (3/4 del ancho) */}
      <div class="lg:col-span-3">
        {/* Encabezado */}
        <div class="mb-6">
          <div class="flex items-center mb-2">
            <a href={`/projects/${project.id}`} class="text-blue-600 hover:text-blue-800">
              {project.name}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <a href={`/user-stories/${userStory.id}`} class="text-blue-600 hover:text-blue-800">
              {userStory.title}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <a
              href={`/user-stories/${userStory.id}/tasks`}
              class="text-blue-600 hover:text-blue-800"
            >
              Tareas
            </a>
          </div>

          <div class="flex justify-between items-start">
            <h1 class="text-3xl font-bold text-gray-800">{currentTask.title}</h1>
            {canManageTask && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                class="text-blue-600 hover:text-blue-800"
                title="Editar Tarea"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>

          <div class="mt-2">
            <span
              class={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(currentTask.status)}`}
            >
              {getStatusText(currentTask.status)}
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Descripción</h2>
            {currentTask.description ? (
              <p class="text-gray-700 whitespace-pre-line">{currentTask.description}</p>
            ) : (
              <p class="text-gray-500 italic">Sin descripción</p>
            )}
          </div>
        </div>

        {/* Información de tiempo */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Información de tiempo</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Tiempo estimado</h3>
                <p class="text-lg font-semibold">
                  {currentTask.estimatedHours !== undefined
                    ? `${currentTask.estimatedHours} horas`
                    : "No estimado"}
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Tiempo dedicado</h3>
                <p class="text-lg font-semibold">
                  {currentTask.spentHours !== undefined
                    ? `${currentTask.spentHours} horas`
                    : "0 horas"}
                </p>
              </div>
            </div>

            {canManageTask && (
              <div>
                <h3 class="text-md font-semibold text-gray-700 mb-2">Registrar tiempo</h3>
                <form onSubmit={handleLogTime} class="flex items-end space-x-2">
                  <div class="flex-grow">
                    <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="timeToLog">
                      Horas dedicadas
                    </label>
                    <input
                      type="number"
                      id="timeToLog"
                      name="timeToLog"
                      min="0.1"
                      step="0.1"
                      value={timeToLog}
                      onChange={(e) => setTimeToLog((e.target as HTMLInputElement).value)}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 2.5"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoggingTime}
                    class="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoggingTime ? "Registrando..." : "Registrar"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Evaluación (si es un entregable) */}
        {currentTask.isDeliverable && (
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Evaluación</h3>
            <TaskEvaluation task={currentTask} userId={currentUserId} userRole={currentUserRole} />
          </div>
        )}

        {/* Historial de cambios */}
        <TaskHistory taskId={task.id} />

        {/* Comentarios */}
        <TaskComments taskId={task.id} userId={currentUserId} />
      </div>

      {/* Panel lateral (1/4 del ancho) */}
      <div class="lg:col-span-1">
        {/* Información de la tarea */}
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Detalles</h2>

            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Asignado a</h3>
                <p class="text-gray-800">
                  {assignedUser ? (
                    assignedUser.firstName && assignedUser.lastName ? (
                      `${assignedUser.firstName} ${assignedUser.lastName}`
                    ) : (
                      assignedUser.username
                    )
                  ) : (
                    <span class="text-gray-500 italic">No asignado</span>
                  )}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Creado por</h3>
                <p class="text-gray-800">
                  {createdByUser ? (
                    createdByUser.firstName && createdByUser.lastName ? (
                      `${createdByUser.firstName} ${createdByUser.lastName}`
                    ) : (
                      createdByUser.username
                    )
                  ) : (
                    <span class="text-gray-500 italic">Desconocido</span>
                  )}
                </p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Creado el</h3>
                <p class="text-gray-800">{formatDate(currentTask.createdAt)}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Última actualización</h3>
                <p class="text-gray-800">{formatDate(currentTask.updatedAt)}</p>
              </div>

              <div>
                <h3 class="text-sm font-medium text-gray-500">Historia de usuario</h3>
                <p class="text-gray-800">
                  <a
                    href={`/user-stories/${userStory.id}`}
                    class="text-blue-600 hover:text-blue-800"
                  >
                    {userStory.title}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {canManageTask && !isUpdatingStatus && (
          <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
            <div class="p-4">
              <h2 class="text-lg font-semibold text-gray-800 mb-3">Acciones</h2>

              <div class="space-y-2">
                {currentTask.status !== TaskStatus.TODO && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.TODO)}
                    class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium"
                  >
                    Mover a Por hacer
                  </button>
                )}

                {currentTask.status !== TaskStatus.IN_PROGRESS && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                    class="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                  >
                    Mover a En progreso
                  </button>
                )}

                {currentTask.status !== TaskStatus.REVIEW && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.REVIEW)}
                    class="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm font-medium"
                  >
                    Mover a Revisión
                  </button>
                )}

                {currentTask.status !== TaskStatus.DONE && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.DONE)}
                    class="w-full px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded text-sm font-medium"
                  >
                    Marcar como Completada
                  </button>
                )}

                {currentTask.status !== TaskStatus.BLOCKED && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(TaskStatus.BLOCKED)}
                    class="w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium"
                  >
                    Marcar como Bloqueada
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  class="w-full px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded text-sm font-medium"
                >
                  Editar tarea
                </button>
              </div>
            </div>
          </div>
        )}

        {isUpdatingStatus && (
          <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 p-4 mb-6">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
            <p class="text-center mt-2 text-gray-600">Actualizando estado...</p>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Modal para editar tarea */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Editar Tarea</h2>
          <EditTaskForm
            task={currentTask}
            onSuccess={handleTaskUpdated}
            onCancel={() => setShowEditModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
