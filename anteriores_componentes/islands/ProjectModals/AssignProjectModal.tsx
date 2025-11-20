import type { Project } from "../../models/project.ts";
import AssignProjectForm from "../AssignProjectForm.tsx";
import Modal from "../Modal.tsx";

interface AssignProjectModalProps {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignProjectModal({
  show,
  project,
  onClose,
  onSuccess,
}: AssignProjectModalProps) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Asignar Usuarios al Proyecto</h2>
        {project && (
          <AssignProjectForm project={project} onSuccess={onSuccess} onCancel={onClose} />
        )}
      </div>
    </Modal>
  );
}
