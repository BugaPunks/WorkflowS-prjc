import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Project } from "../../models/project.ts";
import { UserRole } from "../../models/user.ts";
import { type UserStory, UserStoryStatus } from "../../models/userStory.ts";
import { deleteUserStory, getUserStories } from "../../services/userStoryService.ts";
import Modal from "../Modal.tsx";
import CreateUserStoryForm from "./CreateUserStoryForm.tsx";
import EditUserStoryForm from "./EditUserStoryForm.tsx";
import UserStoryCard from "./UserStoryCard.tsx";

interface UserStoriesListProps {
  initialUserStories: UserStory[];
  projects: Project[];
  userRole: UserRole;
  projectId?: string;
}

export default function UserStoriesList({
  initialUserStories,
  projects,
  userRole,
  projectId,
}: UserStoriesListProps) {
  const [_userStories, setUserStories] = useState<UserStory[]>(initialUserStories);
  const [filteredUserStories, setFilteredUserStories] = useState<UserStory[]>(initialUserStories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStoryStatus | "all">("all");

  const isProductOwner = userRole === UserRole.PRODUCT_OWNER || userRole === UserRole.ADMIN;
  const isScrumMaster = userRole === UserRole.SCRUM_MASTER || userRole === UserRole.ADMIN;

  // Función para cargar las historias de usuario desde el servidor
  const loadUserStories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: { projectId?: string; status?: string } = {};

      if (projectId) {
        filters.projectId = projectId;
      }

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const userStoriesData = await getUserStories(filters);
      setUserStories(userStoriesData);
      setFilteredUserStories(userStoriesData);
    } catch (err) {
      setError("Error al cargar las historias de usuario. Por favor, intenta de nuevo.");
      console.error("Error cargando historias de usuario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar historias de usuario al montar el componente o cuando cambia el filtro
  useEffect(() => {
    loadUserStories();
  }, [projectId, statusFilter]); // No es necesario incluir loadUserStories como dependencia ya que es una función definida en el componente

  // Función para manejar la creación exitosa de una historia de usuario
  const handleUserStoryCreated = () => {
    loadUserStories();
    setShowCreateModal(false);
  };

  // Función para manejar la edición exitosa de una historia de usuario
  const handleUserStoryEdited = () => {
    loadUserStories();
    setShowEditModal(false);
    setSelectedUserStory(null);
  };

  // Función para abrir el modal de edición
  const openEditModal = (userStory: UserStory) => {
    setSelectedUserStory(userStory);
    setShowEditModal(true);
  };

  // Función para abrir el modal de confirmación de eliminación
  const openDeleteConfirmModal = (userStory: UserStory) => {
    setSelectedUserStory(userStory);
    setShowDeleteConfirmModal(true);
    setDeleteError(null);
  };

  // Función para eliminar una historia de usuario
  const deleteSelectedUserStory = async () => {
    if (!selectedUserStory) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteUserStory(selectedUserStory.id);

      // Actualizar la lista de historias de usuario
      loadUserStories();
      setShowDeleteConfirmModal(false);
      setSelectedUserStory(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para filtrar historias de usuario por estado
  const handleStatusFilterChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setStatusFilter(target.value as UserStoryStatus | "all");
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Historias de Usuario</h1>
        <div class="flex space-x-2">
          {isProductOwner && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Crear Historia
            </Button>
          )}
          {projectId && (
            <a
              href={`/projects/${projectId}`}
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Volver al Proyecto
            </a>
          )}
        </div>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <div class="bg-white shadow-md rounded-lg p-4 mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div class="mb-4 md:mb-0">
            <h2 class="text-lg font-semibold text-gray-800">Filtrar por Estado</h2>
            <p class="text-gray-600">Selecciona un estado para filtrar las historias de usuario.</p>
          </div>
          <div class="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value={UserStoryStatus.BACKLOG}>Backlog</option>
              <option value={UserStoryStatus.PLANNED}>Planificada</option>
              <option value={UserStoryStatus.IN_PROGRESS}>En Progreso</option>
              <option value={UserStoryStatus.TESTING}>En Pruebas</option>
              <option value={UserStoryStatus.DONE}>Completada</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : filteredUserStories.length === 0 ? (
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay historias de usuario</h3>
          <p class="text-gray-600 mb-4">
            {projectId
              ? "Este proyecto no tiene historias de usuario con el estado seleccionado."
              : "No hay historias de usuario con el estado seleccionado."}
          </p>
          {isProductOwner && (
            <Button
              onClick={() => setShowCreateModal(true)}
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Crear Historia de Usuario
            </Button>
          )}
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUserStories.map((userStory) => (
            <UserStoryCard
              key={userStory.id}
              userStory={userStory}
              onEdit={openEditModal}
              onDelete={openDeleteConfirmModal}
              isProductOwner={isProductOwner}
              isScrumMaster={isScrumMaster}
            />
          ))}
        </div>
      )}

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

      {/* Modal para confirmar eliminación */}
      <Modal
        show={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        maxWidth="sm"
      >
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Confirmar Eliminación</h2>
          <p class="mb-4 text-gray-600">
            ¿Estás seguro de que deseas eliminar la historia de usuario "{selectedUserStory?.title}
            "? Esta acción no se puede deshacer.
          </p>

          {deleteError && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{deleteError}</p>
            </div>
          )}

          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              onClick={() => setShowDeleteConfirmModal(false)}
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={deleteSelectedUserStory}
              disabled={isDeleting}
              class={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
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
