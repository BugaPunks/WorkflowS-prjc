import { useCallback, useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";
import { getUserStoryTasks, updateTask } from "../../services/taskService.ts";
import Modal from "../Modal.tsx";
import CreateTaskForm from "./CreateTaskForm.tsx";
import TaskCard from "./TaskCard.tsx";

interface TasksListProps {
  userStoryId: string;
  initialTasks: Task[];
  canManageTasks: boolean;
}

export default function TasksList({ userStoryId, initialTasks, canManageTasks }: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [highlightedColumn, setHighlightedColumn] = useState<TaskStatus | null>(null);

  // Configuración de límites WIP (Work In Progress)
  const WIP_LIMIT = 3; // Límite de tareas en progreso

  // Cargar estilos CSS para drag & drop
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/drag-drop.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Cargar tareas
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tasksData = await getUserStoryTasks(userStoryId);
      setTasks(tasksData);
    } catch (err) {
      setError("Error al cargar las tareas. Por favor, intenta de nuevo.");
      console.error("Error cargando tareas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userStoryId]);

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Función para manejar la creación exitosa de una tarea
  const handleTaskCreated = () => {
    loadTasks();
    setShowCreateModal(false);
  };

  // Funciones para drag & drop
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setIsDragging(false);
    setHighlightedColumn(null);
  };

  const handleDragOver = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      setHighlightedColumn(status);
    }
  };

  const handleDragLeave = () => {
    setHighlightedColumn(null);
  };

  const handleDrop = async (newStatus: TaskStatus) => {
    setHighlightedColumn(null);

    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    // Verificar límite WIP para la columna "En progreso"
    if (newStatus === TaskStatus.IN_PROGRESS) {
      const currentInProgressCount = tasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS && t.id !== draggedTask.id
      ).length;

      if (currentInProgressCount >= WIP_LIMIT) {
        setError(
          `Límite de tareas en progreso alcanzado (máximo ${WIP_LIMIT}). Completa alguna tarea antes de añadir más.`
        );
        setTimeout(() => setError(null), 5000); // Limpiar el error después de 5 segundos
        return;
      }
    }

    try {
      // Actualizar localmente para una experiencia más fluida
      const updatedTasks = tasks.map((task) => {
        if (task.id === draggedTask.id) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      setTasks(updatedTasks);

      // Actualizar en el servidor
      await updateTask(draggedTask.id, { status: newStatus });

      // Recargar para asegurar sincronización
      loadTasks();
    } catch (err) {
      setError("Error al actualizar el estado de la tarea. Por favor, intenta de nuevo.");
      console.error("Error actualizando estado de tarea:", err);
      // Recargar para restaurar el estado correcto
      loadTasks();
    }
  };

  // Agrupar tareas por estado
  const todoTasks = tasks.filter((task) => task.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS);
  const reviewTasks = tasks.filter((task) => task.status === TaskStatus.REVIEW);
  const doneTasks = tasks.filter((task) => task.status === TaskStatus.DONE);
  const blockedTasks = tasks.filter((task) => task.status === TaskStatus.BLOCKED);

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Tareas</h2>
        {canManageTasks && (
          <Button
            onClick={() => setShowCreateModal(true)}
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Crear Tarea
          </Button>
        )}
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Indicador de arrastre */}
      {isDragging && draggedTask && (
        <div class="bg-blue-100 text-blue-800 p-2 mb-4 rounded-md flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
          </svg>
          Moviendo tarea: <span class="font-semibold ml-1">{draggedTask.title}</span>
        </div>
      )}

      {isLoading ? (
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : tasks.length === 0 ? (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p class="text-gray-600">No hay tareas para esta historia de usuario.</p>
          {canManageTasks && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear la primera tarea
            </Button>
          )}
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna: Por hacer */}
          <div
            class={`bg-gray-50 rounded-lg p-4 drop-zone column-todo ${highlightedColumn === TaskStatus.TODO ? "drop-zone-highlight" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(TaskStatus.TODO);
            }}
            onDragLeave={() => handleDragLeave()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(TaskStatus.TODO);
            }}
          >
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Por hacer ({todoTasks.length})</h3>
            <div class="space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={canManageTasks}
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  class={`task-draggable ${isDragging && draggedTask?.id === task.id ? "task-dragging" : ""}`}
                >
                  <TaskCard task={task} onUpdate={loadTasks} canManage={canManageTasks} />
                </div>
              ))}
            </div>
          </div>

          {/* Columna: En progreso */}
          <div
            class={`bg-gray-50 rounded-lg p-4 drop-zone column-in-progress ${highlightedColumn === TaskStatus.IN_PROGRESS ? "drop-zone-highlight" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(TaskStatus.IN_PROGRESS);
            }}
            onDragLeave={() => handleDragLeave()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(TaskStatus.IN_PROGRESS);
            }}
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-700">
                En progreso ({inProgressTasks.length})
              </h3>
              <div
                class={`text-xs px-2 py-1 rounded-full flex items-center ${inProgressTasks.length >= WIP_LIMIT ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}
                title="Límite de tareas en progreso"
              >
                <span>{inProgressTasks.length}</span>
                <span class="mx-1">/</span>
                <span>{WIP_LIMIT}</span>
              </div>
            </div>
            <div class="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={canManageTasks}
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  class={`task-draggable ${isDragging && draggedTask?.id === task.id ? "task-dragging" : ""}`}
                >
                  <TaskCard task={task} onUpdate={loadTasks} canManage={canManageTasks} />
                </div>
              ))}
            </div>
          </div>

          {/* Columna: Completadas */}
          <div
            class={`bg-gray-50 rounded-lg p-4 drop-zone column-done ${highlightedColumn === TaskStatus.DONE ? "drop-zone-highlight" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(TaskStatus.DONE);
            }}
            onDragLeave={() => handleDragLeave()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(TaskStatus.DONE);
            }}
          >
            <h3 class="text-lg font-semibold text-gray-700 mb-4">
              Completadas ({doneTasks.length})
            </h3>
            <div class="space-y-3">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  draggable={canManageTasks}
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  class={`task-draggable ${isDragging && draggedTask?.id === task.id ? "task-dragging" : ""}`}
                >
                  <TaskCard task={task} onUpdate={loadTasks} canManage={canManageTasks} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sección para tareas en revisión */}
      {reviewTasks.length > 0 && (
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            En revisión ({reviewTasks.length})
          </h3>
          <div
            class={`grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-lg drop-zone column-review ${highlightedColumn === TaskStatus.REVIEW ? "drop-zone-highlight" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(TaskStatus.REVIEW);
            }}
            onDragLeave={() => handleDragLeave()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(TaskStatus.REVIEW);
            }}
          >
            {reviewTasks.map((task) => (
              <div
                key={task.id}
                draggable={canManageTasks}
                onDragStart={() => handleDragStart(task)}
                onDragEnd={handleDragEnd}
                class={`task-draggable ${isDragging && draggedTask?.id === task.id ? "task-dragging" : ""}`}
              >
                <TaskCard task={task} onUpdate={loadTasks} canManage={canManageTasks} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección para tareas bloqueadas */}
      {blockedTasks.length > 0 && (
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            Bloqueadas ({blockedTasks.length})
          </h3>
          <div
            class={`grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg drop-zone column-blocked ${highlightedColumn === TaskStatus.BLOCKED ? "drop-zone-highlight" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(TaskStatus.BLOCKED);
            }}
            onDragLeave={() => handleDragLeave()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(TaskStatus.BLOCKED);
            }}
          >
            {blockedTasks.map((task) => (
              <div
                key={task.id}
                draggable={canManageTasks}
                onDragStart={() => handleDragStart(task)}
                onDragEnd={handleDragEnd}
                class={`task-draggable ${isDragging && draggedTask?.id === task.id ? "task-dragging" : ""}`}
              >
                <TaskCard task={task} onUpdate={loadTasks} canManage={canManageTasks} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para crear tarea */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Crear Tarea</h2>
          <CreateTaskForm
            userStoryId={userStoryId}
            onSuccess={handleTaskCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
