import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import type { Deliverable } from "../../models/deliverable.ts";
import type { Task } from "../../models/task.ts";
import { TaskStatus } from "../../models/task.ts";

interface PendingDeliverablesListProps {
  projectId?: string;
  onSelectDeliverable?: (deliverable: Deliverable) => void;
}

export default function PendingDeliverablesList({
  projectId,
  onSelectDeliverable,
}: PendingDeliverablesListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar entregables pendientes de evaluación
  useEffect(() => {
    const fetchDeliverables = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "/api/tasks?status=review";

        if (projectId) {
          url += `&projectId=${projectId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error al cargar entregables: ${response.statusText}`);
        }

        const data = await response.json();
        // El API devuelve { tasks }, necesitamos extraer el array
        const tasks = data.tasks || [];

        // Filtrar solo las tareas que son entregables
        const deliverableTasks = tasks.filter((task: Task) => task.isDeliverable === true);
        setDeliverables(deliverableTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar entregables");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, [projectId]);

  // Filtrar entregables
  const filteredDeliverables = deliverables.filter((deliverable) => {
    return (
      deliverable.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverable.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Renderizar estado del entregable
  const renderStatus = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.REVIEW:
        return (
          <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            En revisión
          </span>
        );
      case TaskStatus.DONE:
        return (
          <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completado</span>
        );
      default:
        return (
          <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
        );
    }
  };

  return (
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Entregables Pendientes de Evaluación</h2>
        </div>

        <div class="mb-4">
          <input
            type="text"
            placeholder="Buscar entregables..."
            value={searchTerm}
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <p class="mt-2 text-gray-600">Cargando entregables...</p>
        </div>
      ) : error ? (
        <div class="p-4 text-center text-red-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="mt-2 text-blue-600 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : filteredDeliverables.length === 0 ? (
        <div class="p-8 text-center text-gray-500">
          <p>No hay entregables pendientes de evaluación.</p>
        </div>
      ) : (
        <ul class="divide-y divide-gray-200">
          {filteredDeliverables.map((deliverable) => (
            <li key={deliverable.id} class="p-4 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3
                      class="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                      onClick={() => onSelectDeliverable?.(deliverable)}
                    >
                      {deliverable.title}
                    </h3>
                    {renderStatus(deliverable.status)}
                    {deliverable.submittedAt && (
                      <span class="text-xs text-gray-500">
                        Enviado el {formatDate(deliverable.submittedAt)}
                      </span>
                    )}
                  </div>
                  {deliverable.description && (
                    <p class="mt-1 text-sm text-gray-600">{deliverable.description}</p>
                  )}
                  <div class="mt-2 flex items-center gap-4">
                    <span class="text-xs text-gray-500 flex items-center">
                      <MaterialIcon icon="person" class="mr-1"           size="sm" />
                      {deliverable.assignedTo
                        ? `Asignado a: ${deliverable.assignedTo}`
                        : "Sin asignar"}
                    </span>
                    {deliverable.dueDate && (
                      <span class="text-xs text-gray-500 flex items-center">
                        <MaterialIcon icon="event" class="mr-1"           size="sm" />
                        Fecha límite: {formatDate(deliverable.dueDate)}
                      </span>
                    )}
                    {deliverable.attachments && deliverable.attachments.length > 0 && (
                      <span class="text-xs text-gray-500 flex items-center">
                        <MaterialIcon icon="attach_file" class="mr-1"           size="sm" />
                        {deliverable.attachments.length} adjunto(s)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    onClick={() => onSelectDeliverable?.(deliverable)}
                    variant="primary"
                    size="sm"
                  >
                    Evaluar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
