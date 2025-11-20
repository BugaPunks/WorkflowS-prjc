import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import type { Deliverable } from "../../models/deliverable.ts";
import { TaskStatus } from "../../models/task.ts";

interface DeliverableDetailsProps {
  deliverableId: string;
  onBack?: () => void;
  onEvaluate?: (deliverable: Deliverable) => void;
}

export default function DeliverableDetails({
  deliverableId,
  onBack,
  onEvaluate,
}: DeliverableDetailsProps) {
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar detalles del entregable
  useEffect(() => {
    const fetchDeliverable = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Cargando entregable con ID: ${deliverableId}`);

        // Usar el endpoint de tareas ya que los entregables son tareas con isDeliverable=true
        const response = await fetch(`/api/tasks/${deliverableId}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error del servidor: ${response.status} - ${errorText}`);
          throw new Error(`Error al cargar el entregable: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);

        // El API de tareas devuelve { task }, extraer la tarea
        const task = data.task || data;

        if (!task) {
          throw new Error('No se recibieron datos de la tarea');
        }

        setDeliverable(task);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el entregable");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverable();
  }, [deliverableId]);

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

  if (loading) {
    return (
      <div class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p class="mt-2 text-gray-600">Cargando entregable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="p-4 text-center text-red-600">
        <p>{error}</p>
        <button type="button" onClick={() => globalThis.location.reload()} class="mt-2 text-blue-600 hover:underline">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div class="p-8 text-center text-gray-500">
        <p>No se encontró el entregable.</p>
        {onBack && (
          <button type="button" onClick={onBack} class="mt-2 text-blue-600 hover:underline">
            Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            {onBack && (
              <button type="button" onClick={onBack} class="text-gray-500 hover:text-gray-700">
                ← Volver
              </button>
            )}
            <h2 class="text-2xl font-bold text-gray-900">{deliverable.title}</h2>
            {renderStatus(deliverable.status)}
          </div>
          {deliverable.description && <p class="text-gray-600 mt-2">{deliverable.description}</p>}
        </div>

        {onEvaluate && <Button onClick={() => onEvaluate(deliverable)}>Evaluar Entregable</Button>}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Información del Entregable</h3>
          <ul class="space-y-2">
            <li class="flex items-center text-gray-700">
              <MaterialIcon icon="person" class="mr-2" />
              <span class="font-medium">Asignado a:</span>
              <span class="ml-2">{deliverable.assignedTo || "Sin asignar"}</span>
            </li>
            {deliverable.dueDate && (
              <li class="flex items-center text-gray-700">
                <MaterialIcon icon="event" class="mr-2" />
                <span class="font-medium">Fecha límite:</span>
                <span class="ml-2">{formatDate(deliverable.dueDate)}</span>
              </li>
            )}
            {deliverable.submittedAt && (
              <li class="flex items-center text-gray-700">
                <MaterialIcon icon="check_circle" class="mr-2" />
                <span class="font-medium">Enviado el:</span>
                <span class="ml-2">{formatDate(deliverable.submittedAt)}</span>
              </li>
            )}
            {deliverable.submittedBy && (
              <li class="flex items-center text-gray-700">
                <MaterialIcon icon="person" class="mr-2" />
                <span class="font-medium">Enviado por:</span>
                <span class="ml-2">{deliverable.submittedBy}</span>
              </li>
            )}
            <li class="flex items-center text-gray-700">
              <MaterialIcon icon="history" class="mr-2" />
              <span class="font-medium">Creado el:</span>
              <span class="ml-2">{formatDate(deliverable.createdAt)}</span>
            </li>
          </ul>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Instrucciones de Entrega</h3>
          {deliverable.submissionInstructions ? (
            <p class="text-gray-700">{deliverable.submissionInstructions}</p>
          ) : (
            <p class="text-gray-500 italic">No se proporcionaron instrucciones específicas.</p>
          )}
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Archivos Adjuntos</h3>
        {deliverable.attachments && deliverable.attachments.length > 0 ? (
          <ul class="space-y-2 bg-gray-50 p-4 rounded-lg">
            {deliverable.attachments.map((attachment) => (
              <li key={attachment.id} class="flex items-center justify-between">
                <div class="flex items-center">
                  <MaterialIcon
                    icon={
                      attachment.fileType.includes("image")
                        ? "image"
                        : attachment.fileType.includes("pdf")
                          ? "picture_as_pdf"
                          : "insert_drive_file"
                    }
                    class="mr-2"
                  />
                  <span class="text-gray-700">{attachment.fileName}</span>
                  <span class="ml-2 text-xs text-gray-500">
                    ({Math.round(attachment.fileSize / 1024)} KB)
                  </span>
                </div>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-800"
                >
                  <MaterialIcon icon="download" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p class="text-gray-500 italic bg-gray-50 p-4 rounded-lg">No hay archivos adjuntos.</p>
        )}
      </div>

      {onEvaluate && (
        <div class="mt-8 text-center">
          <Button onClick={() => onEvaluate(deliverable)} size="lg">
            Proceder a Evaluar
          </Button>
        </div>
      )}
    </div>
  );
}
