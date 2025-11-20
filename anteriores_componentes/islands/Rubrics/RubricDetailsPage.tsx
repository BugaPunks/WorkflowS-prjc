import { useState, useEffect } from "preact/hooks";
import { UserRole } from "../../models/user.ts";
import type { Rubric } from "../../models/rubric.ts";
import DeleteRubricModal from "./DeleteRubricModal.tsx";
import RubricDetails from "./RubricDetails.tsx";

interface RubricDetailsPageProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  rubricId: string;
}

export default function RubricDetailsPage({ session, rubricId }: RubricDetailsPageProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar la rúbrica
  useEffect(() => {
    const fetchRubric = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rubrics/${rubricId}`);
        if (response.ok) {
          const rubricData = await response.json();
          setRubric(rubricData);
        }
      } catch (error) {
        console.error("Error al cargar la rúbrica:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRubric();
  }, [rubricId]);

  // Determinar si el usuario puede editar rúbricas
  const canEditRubrics =
    session.role === UserRole.ADMIN ||
    session.role === UserRole.PRODUCT_OWNER ||
    session.role === UserRole.SCRUM_MASTER;

  // Manejar la edición de la rúbrica
  const handleEdit = () => {
    globalThis.location.href = `/rubrics/${rubricId}/edit`;
  };

  // Manejar la eliminación de la rúbrica
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Manejar la finalización de la eliminación
  const handleDeleteComplete = () => {
    // Redirigir a la lista de rúbricas
    globalThis.location.href = "/rubrics";
  };

  // Manejar el botón de volver
  const handleBack = () => {
    globalThis.location.href = "/rubrics";
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="text-gray-500">Cargando rúbrica...</div>
      </div>
    );
  }

  if (!rubric) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="text-red-500">Error: No se pudo cargar la rúbrica</div>
      </div>
    );
  }

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Detalles de Rúbrica</h1>

        {canEditRubrics && (
          <div class="flex space-x-4">
            <button
              type="button"
              onClick={handleEdit}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      <RubricDetails
        rubricId={rubricId}
        onEdit={canEditRubrics ? handleEdit : undefined}
        onBack={handleBack}
      />

      {showDeleteModal && rubric && (
        <DeleteRubricModal
          rubric={rubric}
          onDelete={handleDeleteComplete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
