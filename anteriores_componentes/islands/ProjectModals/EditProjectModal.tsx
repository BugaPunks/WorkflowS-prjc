import type { Project } from "../../models/project.ts";
import EditProjectForm from "../EditProjectForm.tsx";
import Modal from "../Modal.tsx";

interface EditProjectModalProps {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProjectModal({
  show,
  project,
  onClose,
  onSuccess,
}: EditProjectModalProps) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Editar Proyecto</h2>
        {project && <EditProjectForm project={project} onSuccess={onSuccess} onCancel={onClose} />}
      </div>
    </Modal>
  );
}
