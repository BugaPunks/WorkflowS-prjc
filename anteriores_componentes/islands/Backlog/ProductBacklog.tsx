import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";
import { type UserStory, UserStoryPriority, UserStoryStatus } from "../../models/userStory.ts";
import Modal from "../Modal.tsx";
import CreateUserStoryForm from "../UserStories/CreateUserStoryForm.tsx";
import EditUserStoryForm from "../UserStories/EditUserStoryForm.tsx";
import BacklogFilters from "./BacklogFilters.tsx";
import BacklogHeader from "./BacklogHeader.tsx";
import BacklogItemCard from "./BacklogItemCard.tsx";
import BacklogMetrics from "./BacklogMetrics.tsx";

interface ProductBacklogProps {
  initialBacklogItems: UserStory[];
  projects: Project[];
  projectId?: string;
  currentProject: Project | null;
  isProductOwner: boolean;
  isAdmin: boolean;
  _userId?: string;
}

export default function ProductBacklog({
  initialBacklogItems,
  projects,
  projectId,
  currentProject,
  isProductOwner,
  isAdmin,
  _userId,
}: ProductBacklogProps) {
  // Estado para las historias de usuario
  const [backlogItems, setBacklogItems] = useState<UserStory[]>(initialBacklogItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para filtros
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estado para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStory | null>(null);

  // Estado para drag and drop
  const [draggedItem, setDraggedItem] = useState<UserStory | null>(null);
  const [_isDragging, setIsDragging] = useState(false);
  const [highlightedZone, setHighlightedZone] = useState<UserStoryPriority | null>(null);

  // Cargar historias de usuario (memoizado para evitar recreaciones innecesarias)
  const loadBacklogItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = "/api/user-stories?status=backlog";

      if (projectId) {
        url += `&projectId=${projectId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al cargar el backlog");
      }

      const data = await response.json();
      setBacklogItems(data.userStories);
    } catch (err) {
      setError("Error al cargar el backlog. Por favor, intenta de nuevo.");
      console.error("Error cargando backlog:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Memorizar los items filtrados para evitar recalculos innecesarios
  const filteredItems = useMemo(() => {
    let result = [...backlogItems];

    // Filtrar por prioridad
    if (priorityFilter !== "all") {
      result = result.filter((item) => item.priority === priorityFilter);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [backlogItems, priorityFilter, searchQuery]);

  // Efecto para cargar historias cuando cambia el proyecto
  useEffect(() => {
    loadBacklogItems();
  }, [loadBacklogItems]);

  // Manejadores para modales
  const handleCreateUserStory = () => {
    setShowCreateModal(true);
  };

  const handleEditUserStory = (userStory: UserStory) => {
    setSelectedUserStory(userStory);
    setShowEditModal(true);
  };

  const handleUserStoryCreated = () => {
    loadBacklogItems();
    setShowCreateModal(false);
  };

  const handleUserStoryEdited = () => {
    loadBacklogItems();
    setShowEditModal(false);
    setSelectedUserStory(null);
  };

  // Manejadores para drag and drop
  const handleDragStart = (userStory: UserStory) => {
    setDraggedItem(userStory);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
    setHighlightedZone(null);
  };

  const handleDragOver = (priority: UserStoryPriority) => {
    if (draggedItem && draggedItem.priority !== priority) {
      setHighlightedZone(priority);
    }
  };

  const handleDragLeave = () => {
    setHighlightedZone(null);
  };

  const handleDrop = async (targetPriority: UserStoryPriority) => {
    setHighlightedZone(null);

    if (!draggedItem || draggedItem.priority === targetPriority) {
      return;
    }

    try {
      // Actualizar la prioridad en el servidor
      const response = await fetch(`/api/user-stories/${draggedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priority: targetPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la prioridad");
      }

      // Recargar el backlog
      loadBacklogItems();
    } catch (err) {
      setError("Error al actualizar la prioridad. Por favor, intenta de nuevo.");
      console.error("Error actualizando prioridad:", err);
    }
  };

  // Función para eliminar una historia de usuario
  const handleDeleteUserStory = async (userStory: UserStory) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta historia de usuario?")) {
      return;
    }

    try {
      const response = await fetch(`/api/user-stories/${userStory.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la historia de usuario");
      }

      // Recargar el backlog
      loadBacklogItems();
    } catch (err) {
      setError("Error al eliminar la historia de usuario. Por favor, intenta de nuevo.");
      console.error("Error eliminando historia de usuario:", err);
    }
  };

  // Función para mover una historia al sprint
  const handleMoveToSprint = async (userStory: UserStory) => {
    try {
      const response = await fetch(`/api/user-stories?id=${userStory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: UserStoryStatus.PLANNED,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al mover la historia al sprint");
      }

      // Recargar el backlog
      loadBacklogItems();
    } catch (err) {
      setError("Error al mover la historia al sprint. Por favor, intenta de nuevo.");
      console.error("Error moviendo historia al sprint:", err);
    }
  };

  return (
    <div>
      {/* Encabezado del backlog */}
      <BacklogHeader
        projectId={projectId}
        currentProject={currentProject}
        projects={projects}
        onCreateUserStory={handleCreateUserStory}
        isProductOwner={isProductOwner}
        isAdmin={isAdmin}
      />

      {/* Mensaje de error si existe */}
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Filtros y métricas */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="md:col-span-2">
          <BacklogFilters
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>
        <div>
          <BacklogMetrics backlogItems={backlogItems} />
        </div>
      </div>

      {/* Contenido del backlog */}
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Elementos del Backlog</h2>

        {isLoading ? (
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              role="img"
            >
              <title>No hay historias de usuario</title>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No hay elementos en el backlog</h3>
            <p class="text-gray-600 mb-4">
              {projectId
                ? "Este proyecto no tiene historias de usuario en el backlog."
                : "No hay historias de usuario en el backlog."}
            </p>
            {(isProductOwner || isAdmin) && (
              <Button
                onClick={handleCreateUserStory}
                class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Crear Historia de Usuario
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Secciones de prioridad para drag and drop */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sección Crítica */}
              <div
                class={`bg-red-50 border border-red-200 rounded-lg p-4 drop-zone priority-critical ${highlightedZone === UserStoryPriority.CRITICAL ? "drop-zone-highlight" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver(UserStoryPriority.CRITICAL);
                }}
                onDragLeave={() => handleDragLeave()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(UserStoryPriority.CRITICAL);
                }}
              >
                <h3 class="font-semibold text-red-800 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  Prioridad Crítica
                </h3>
                <div class="space-y-4">
                  {filteredItems
                    .filter((item) => item.priority === UserStoryPriority.CRITICAL)
                    .map((item) => (
                      <BacklogItemCard
                        key={item.id}
                        userStory={item}
                        onEdit={handleEditUserStory}
                        onDelete={handleDeleteUserStory}
                        onMoveToSprint={handleMoveToSprint}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isProductOwner={isProductOwner}
                        isAdmin={isAdmin}
                      />
                    ))}
                </div>
              </div>

              {/* Sección Alta */}
              <div
                class={`bg-orange-50 border border-orange-200 rounded-lg p-4 drop-zone priority-high ${highlightedZone === UserStoryPriority.HIGH ? "drop-zone-highlight" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver(UserStoryPriority.HIGH);
                }}
                onDragLeave={() => handleDragLeave()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(UserStoryPriority.HIGH);
                }}
              >
                <h3 class="font-semibold text-orange-800 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                  Prioridad Alta
                </h3>
                <div class="space-y-4">
                  {filteredItems
                    .filter((item) => item.priority === UserStoryPriority.HIGH)
                    .map((item) => (
                      <BacklogItemCard
                        key={item.id}
                        userStory={item}
                        onEdit={handleEditUserStory}
                        onDelete={handleDeleteUserStory}
                        onMoveToSprint={handleMoveToSprint}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isProductOwner={isProductOwner}
                        isAdmin={isAdmin}
                      />
                    ))}
                </div>
              </div>

              {/* Sección Media */}
              <div
                class={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 drop-zone priority-medium ${highlightedZone === UserStoryPriority.MEDIUM ? "drop-zone-highlight" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver(UserStoryPriority.MEDIUM);
                }}
                onDragLeave={() => handleDragLeave()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(UserStoryPriority.MEDIUM);
                }}
              >
                <h3 class="font-semibold text-yellow-800 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                  Prioridad Media
                </h3>
                <div class="space-y-4">
                  {filteredItems
                    .filter((item) => item.priority === UserStoryPriority.MEDIUM)
                    .map((item) => (
                      <BacklogItemCard
                        key={item.id}
                        userStory={item}
                        onEdit={handleEditUserStory}
                        onDelete={handleDeleteUserStory}
                        onMoveToSprint={handleMoveToSprint}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isProductOwner={isProductOwner}
                        isAdmin={isAdmin}
                      />
                    ))}
                </div>
              </div>

              {/* Sección Baja */}
              <div
                class={`bg-green-50 border border-green-200 rounded-lg p-4 drop-zone priority-low ${highlightedZone === UserStoryPriority.LOW ? "drop-zone-highlight" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver(UserStoryPriority.LOW);
                }}
                onDragLeave={() => handleDragLeave()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(UserStoryPriority.LOW);
                }}
              >
                <h3 class="font-semibold text-green-800 mb-3 flex items-center">
                  <span class="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  Prioridad Baja
                </h3>
                <div class="space-y-4">
                  {filteredItems
                    .filter((item) => item.priority === UserStoryPriority.LOW)
                    .map((item) => (
                      <BacklogItemCard
                        key={item.id}
                        userStory={item}
                        onEdit={handleEditUserStory}
                        onDelete={handleDeleteUserStory}
                        onMoveToSprint={handleMoveToSprint}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        isProductOwner={isProductOwner}
                        isAdmin={isAdmin}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear historia de usuario */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            {projectId
              ? "Crear Historia de Usuario para el Proyecto Actual"
              : "Crear Nueva Historia de Usuario"}
          </h2>
          <CreateUserStoryForm
            projectId={projectId}
            projects={projects}
            onSuccess={handleUserStoryCreated}
            onCancel={() => setShowCreateModal(false)}
          />
        </div>
      </Modal>

      {/* Modal para editar historia de usuario */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Editar Historia de Usuario</h2>
          {selectedUserStory && (
            <EditUserStoryForm
              userStory={selectedUserStory}
              onSuccess={handleUserStoryEdited}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
