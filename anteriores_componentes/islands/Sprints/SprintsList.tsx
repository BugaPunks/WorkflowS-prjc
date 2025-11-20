import { useCallback, useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { SprintStatus } from "../../models/sprint.ts";
import type { Sprint } from "../../models/sprint.ts";
import { getProjectSprints } from "../../services/sprintService.ts";
import Modal from "../Modal.tsx";
import CreateSprintForm from "./CreateSprintForm.tsx";
import SprintCard from "./SprintCard.tsx";

interface SprintsListProps {
  projectId: string;
  initialSprints: Sprint[];
  canManageSprints: boolean;
}

export default function SprintsList({
  projectId,
  initialSprints,
  canManageSprints,
}: SprintsListProps) {
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar sprints (usando useCallback para memorizar la función)
  const loadSprints = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sprintsData = await getProjectSprints(projectId);
      setSprints(sprintsData);
    } catch (err) {
      setError("Error al cargar los sprints. Por favor, intenta de nuevo.");
      console.error("Error cargando sprints:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Cargar sprints al montar el componente
  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  // Función para manejar la creación exitosa de un sprint
  const handleSprintCreated = () => {
    loadSprints();
    setShowCreateModal(false);
  };

  // Agrupar sprints por estado
  const plannedSprints = sprints.filter((sprint) => sprint.status === SprintStatus.PLANNED);
  const activeSprints = sprints.filter((sprint) => sprint.status === SprintStatus.ACTIVE);
  const completedSprints = sprints.filter((sprint) => sprint.status === SprintStatus.COMPLETED);

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Sprints</h2>
        {canManageSprints && (
          <Button
            onClick={() => setShowCreateModal(true)}
            class="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Crear Sprint
          </Button>
        )}
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : sprints.length === 0 ? (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p class="text-gray-600">No hay sprints para este proyecto.</p>
          {canManageSprints && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crear el primer sprint
            </Button>
          )}
        </div>
      ) : (
        <div class="space-y-8">
          {/* Sprint activo */}
          {activeSprints.length > 0 && (
            <div>
              <h3 class="text-xl font-semibold text-gray-700 mb-4">Sprint Activo</h3>
              <div class="grid grid-cols-1 gap-4">
                {activeSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onUpdate={loadSprints}
                    canManage={canManageSprints}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sprints planificados */}
          {plannedSprints.length > 0 && (
            <div>
              <h3 class="text-xl font-semibold text-gray-700 mb-4">Sprints Planificados</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plannedSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onUpdate={loadSprints}
                    canManage={canManageSprints}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sprints completados */}
          {completedSprints.length > 0 && (
            <div>
              <h3 class="text-xl font-semibold text-gray-700 mb-4">Sprints Completados</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedSprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onUpdate={loadSprints}
                    canManage={canManageSprints}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear sprint */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-4">Crear Sprint</h2>
          <CreateSprintForm
            projectId={projectId}
            onSuccess={handleSprintCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
