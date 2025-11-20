import { useEffect, useState } from "preact/hooks";
import type { Project } from "../models/project.ts";
import AssignProjectForm from "./AssignProjectForm.tsx";
import CreateProjectForm from "./CreateProjectForm.tsx";
import DeleteProjectModal from "./DeleteProjectModal.tsx";
import EditProjectForm from "./EditProjectForm.tsx";
import EmptyProjectsMessage from "./EmptyProjectsMessage.tsx";
import Modal from "./Modal.tsx";
import ProjectCard from "./ProjectCard.tsx";
import ProjectsHeader from "./ProjectsHeader.tsx";
import ProjectsStatusBar from "./ProjectsStatusBar.tsx";

interface ProjectsListProps {
  initialProjects: Project[];
  isAdmin: boolean;
  currentUserId: string;
}

export default function ProjectsList({
  initialProjects,
  isAdmin,
  currentUserId,
}: ProjectsListProps) {
  // Estado
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Estado de proyecto seleccionado y eliminación
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Cargar proyectos desde el servidor
  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Error al cargar los proyectos");
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError("Error al cargar los proyectos. Por favor, intenta de nuevo.");
      console.error("Error cargando proyectos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  // Manejadores de eventos para modales
  const handleCreateProject = () => setShowCreateModal(true);

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleAssignProject = (project: Project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteConfirmModal(true);
    setDeleteError(null);
  };

  // Manejadores de eventos para acciones exitosas
  const handleProjectCreated = () => {
    loadProjects();
    setShowCreateModal(false);
  };

  const handleProjectEdited = () => {
    loadProjects();
    setShowEditModal(false);
    setSelectedProject(null);
  };

  const handleProjectAssigned = () => {
    loadProjects();
    setShowAssignModal(false);
    setSelectedProject(null);
  };

  // Función para eliminar un proyecto
  const deleteSelectedProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/projects?id=${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al eliminar el proyecto");
        } catch (_e) {
          throw new Error(`Error al eliminar el proyecto: ${response.statusText}`);
        }
      }

      // Actualizar la lista de proyectos
      loadProjects();
      setShowDeleteConfirmModal(false);
      setSelectedProject(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Encabezado con título y botones de acción */}
      <ProjectsHeader isAdmin={isAdmin} onCreateProject={handleCreateProject} />

      {/* Mensaje de error si existe */}
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Barra de estado con contador de proyectos e indicador de carga */}
      <ProjectsStatusBar projectCount={projects.length} isLoading={isLoading} />

      {/* Lista de proyectos o mensaje de vacío */}
      {projects.length === 0 ? (
        <EmptyProjectsMessage isAdmin={isAdmin} />
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isAdmin={isAdmin}
              onEdit={handleEditProject}
              onAssign={handleAssignProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Modal para crear proyecto */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Proyecto</h2>
          <CreateProjectForm
            onSuccess={handleProjectCreated}
            onCancel={() => setShowCreateModal(false)}
            currentUserId={currentUserId}
          />
        </div>
      </Modal>

      {/* Modal para asignar proyecto */}
      <Modal show={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="md">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Asignar Usuarios al Proyecto</h2>
          {selectedProject && (
            <AssignProjectForm
              project={selectedProject}
              onSuccess={handleProjectAssigned}
              onCancel={() => setShowAssignModal(false)}
            />
          )}
        </div>
      </Modal>

      {/* Modal para editar proyecto */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Editar Proyecto</h2>
          {selectedProject && (
            <EditProjectForm
              project={selectedProject}
              onSuccess={handleProjectEdited}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </div>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <DeleteProjectModal
        show={showDeleteConfirmModal}
        project={selectedProject}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={deleteSelectedProject}
      />
    </div>
  );
}
