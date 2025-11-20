import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import { deleteTask, updateTask } from "../../services/taskService.ts";
import { getUserById } from "../../services/userService.ts";
import Modal from "../Modal.tsx";
import EditTaskForm from "./EditTaskForm.tsx";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  canManage: boolean;
}

export default function TaskCard({ task, onUpdate, canManage }: TaskCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedUser, setAssignedUser] = useState<{
    username: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Cargar datos del usuario asignado
  useEffect(() => {
    const loadAssignedUser = async () => {
      if (!task.assignedTo) return;

      setIsLoadingUser(true);
      try {
        const user = await getUserById(task.assignedTo);
        if (user) {
          setAssignedUser({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      } catch (error) {
        console.error("Error al cargar usuario asignado:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadAssignedUser();
  }, [task.assignedTo]);

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

  // Función para eliminar la tarea
  const handleDeleteTask = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteTask(task.id);
      onUpdate();
      setShowDeleteConfirmModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la tarea");
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para actualizar el estado de la tarea
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdatingStatus(true);
    setError(null);

    try {
      await updateTask(task.id, { status: newStatus });
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el estado de la tarea");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
      <div class="p-4">
        <div class="flex justify-between items-start">
          <a
            href={`/tasks/${task.id}`}
            class="text-md font-semibold text-gray-800 hover:text-blue-600"
          >
            {task.title}
          </a>
          {canManage && (
            <div class="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                class="text-blue-600 hover:text-blue-800"
                title="Editar Tarea"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                class="text-red-600 hover:text-red-800"
                title="Eliminar Tarea"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div class="mt-2">
          <span
            class={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
        </div>

        {task.description && (
          <div class="mt-3">
            <p class="text-sm text-gray-600">{task.description}</p>
          </div>
        )}

        {task.assignedTo && (
          <div class="mt-3 text-sm">
            <span class="text-gray-500">Asignada a:</span>
            {isLoadingUser ? (
              <span class="ml-1 text-gray-400">Cargando...</span>
            ) : assignedUser ? (
              <span class="ml-1 font-medium">
                {assignedUser.firstName && assignedUser.lastName
                  ? `${assignedUser.firstName} ${assignedUser.lastName}`
                  : assignedUser.username}
              </span>
            ) : (
              <span class="ml-1 font-medium">{task.assignedTo}</span>
            )}
          </div>
        )}

        {(task.estimatedHours || task.spentHours) && (
          <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
            {task.estimatedHours !== undefined && (
              <div>
                <span class="text-gray-500">Estimado:</span>
                <span class="ml-1 font-medium">{task.estimatedHours}h</span>
              </div>
            )}
            {task.spentHours !== undefined && (
              <div>
                <span class="text-gray-500">Dedicado:</span>
                <span class="ml-1 font-medium">{task.spentHours}h</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones rápidas para cambiar el estado */}
        {canManage && !isUpdatingStatus && (
          <div class="mt-4 flex flex-wrap gap-2">
            {task.status !== TaskStatus.TODO && (
              <button
                type="button"
                onClick={() => handleStatusChange(TaskStatus.TODO)}
                class="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Mover a Por hacer
              </button>
            )}
            {task.status !== TaskStatus.IN_PROGRESS && (
              <button
                type="button"
                onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                class="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
              >
                Mover a En progreso
              </button>
            )}
            {task.status !== TaskStatus.REVIEW && (
              <button
                type="button"
                onClick={() => handleStatusChange(TaskStatus.REVIEW)}
                class="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded"
              >
                Mover a Revisión
              </button>
            )}
            {task.status !== TaskStatus.DONE && (
              <button
                type="button"
                onClick={() => handleStatusChange(TaskStatus.DONE)}
                class="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded"
              >
                Marcar como Completada
              </button>
            )}
            {task.status !== TaskStatus.BLOCKED && (
              <button
                type="button"
                onClick={() => handleStatusChange(TaskStatus.BLOCKED)}
                class="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded"
              >
                Marcar como Bloqueada
              </button>
            )}
          </div>
        )}

        {isUpdatingStatus && (
          <div class="mt-4 flex justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          </div>
        )}

        {error && <div class="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      {/* Modal para editar tarea */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Editar Tarea</h2>
          <EditTaskForm
            task={task}
            onSuccess={() => {
              onUpdate();
              setShowEditModal(false);
            }}
            onCancel={() => setShowEditModal(false)}
          />
        </div>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)}>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Confirmar eliminación</h2>
          {error && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          <p class="mb-4">¿Estás seguro de que deseas eliminar esta tarea?</p>
          <div class="flex justify-end space-x-2">
            <Button
              onClick={() => setShowDeleteConfirmModal(false)}
              class="bg-gray-300 hover:bg-gray-400 text-gray-800"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteTask}
              class="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
