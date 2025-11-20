import type { Rubric } from "../../models/rubric.ts";
import type { UserRole } from "../../models/user.ts";
import RubricForm from "./RubricForm.tsx";

interface RubricEditPageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  rubricId: string;
}

export default function RubricEditPage({ session: _session, rubricId }: RubricEditPageProps) {
  // Manejar la finalización de la edición
  const handleSave = (rubric: Rubric) => {
    // Redirigir a la página de detalles
    globalThis.location.href = `/rubrics/${rubric.id}`;
  };

  // Manejar la cancelación
  const handleCancel = () => {
    // Redirigir a la página de detalles
    globalThis.location.href = `/rubrics/${rubricId}`;
  };

  return <RubricForm rubricId={rubricId} onSave={handleSave} onCancel={handleCancel} />;
}
