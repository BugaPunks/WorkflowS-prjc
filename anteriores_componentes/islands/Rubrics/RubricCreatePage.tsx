import type { Rubric } from "../../models/rubric.ts";
import type { UserRole } from "../../models/user.ts";
import RubricForm from "./RubricForm.tsx";

interface RubricCreatePageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projectId?: string;
  isTemplate?: boolean;
}

export default function RubricCreatePage({
  session: _session,
  projectId,
  isTemplate,
}: RubricCreatePageProps) {
  // Manejar la finalización de la creación
  const handleSave = (rubric: Rubric) => {
    // Redirigir a la página de detalles
    globalThis.location.href = `/rubrics/${rubric.id}`;
  };

  // Manejar la cancelación
  const handleCancel = () => {
    // Redirigir a la lista de rúbricas
    globalThis.location.href = "/rubrics";
  };

  return (
    <RubricForm
      projectId={projectId}
      isTemplate={isTemplate}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
