import CreateProjectForm from "../CreateProjectForm.tsx";
import Modal from "../Modal.tsx";

interface CreateProjectModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
}

export default function CreateProjectModal({
  show,
  onClose,
  onSuccess,
  currentUserId,
}: CreateProjectModalProps) {
  return (
    <Modal show={show} onClose={onClose} maxWidth="md">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Proyecto</h2>
        <CreateProjectForm onSuccess={onSuccess} onCancel={onClose} currentUserId={currentUserId} />
      </div>
    </Modal>
  );
}
