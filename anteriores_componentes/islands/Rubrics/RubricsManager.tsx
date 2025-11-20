import { useState } from "preact/hooks";
import type { Rubric } from "../../models/rubric.ts";
import { UserRole } from "../../models/user.ts";
import DeleteRubricModal from "./DeleteRubricModal.tsx";
import DuplicateRubricForm from "./DuplicateRubricForm.tsx";
import RubricDetails from "./RubricDetails.tsx";
import RubricsList from "./RubricsList.tsx";

interface RubricsManagerProps {
  session: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
  projectId?: string;
}

export default function RubricsManager({ session, projectId }: RubricsManagerProps) {
  const [view, setView] = useState<"list" | "details" | "duplicate" | "delete">("list");
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Determinar si el usuario puede editar rúbricas
  const canEditRubrics =
    session.role === UserRole.ADMIN ||
    session.role === UserRole.PRODUCT_OWNER ||
    session.role === UserRole.SCRUM_MASTER;

  // Manejar la selección de una rúbrica
  const handleSelectRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setView("details");
  };

  // Manejar la creación de una nueva rúbrica
  const handleCreateRubric = () => {
    globalThis.location.href = `/rubrics/create${projectId ? `?projectId=${projectId}` : ""}${showTemplates ? "&template=true" : ""}`;
  };

  // Manejar la edición de una rúbrica
  const handleEditRubric = (rubric: Rubric) => {
    globalThis.location.href = `/rubrics/${rubric.id}/edit`;
  };

  // Manejar la duplicación de una rúbrica
  const handleDuplicateRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setView("duplicate");
  };

  // Manejar la eliminación de una rúbrica
  const handleDeleteRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setView("delete");
  };

  // Manejar la finalización de la duplicación
  const handleDuplicateComplete = (newRubric: Rubric) => {
    // Redirigir a la página de detalles de la nueva rúbrica
    globalThis.location.href = `/rubrics/${newRubric.id}`;
  };

  // Manejar la finalización de la eliminación
  const handleDeleteComplete = () => {
    setView("list");
    setSelectedRubric(null);
    // Recargar la página para actualizar la lista
    globalThis.location.reload();
  };

  // Renderizar la vista actual
  const renderView = () => {
    switch (view) {
      case "details":
        if (!selectedRubric) return null;
        return (
          <RubricDetails
            rubricId={selectedRubric.id}
            onEdit={() => handleEditRubric(selectedRubric)}
            onBack={() => setView("list")}
          />
        );

      case "duplicate":
        if (!selectedRubric) return null;
        return (
          <DuplicateRubricForm
            rubric={selectedRubric}
            projectId={projectId}
            onDuplicate={handleDuplicateComplete}
            onCancel={() => setView("list")}
          />
        );

      case "delete":
        if (!selectedRubric) return null;
        return (
          <DeleteRubricModal
            rubric={selectedRubric}
            onDelete={handleDeleteComplete}
            onCancel={() => setView("list")}
          />
        );
      default:
        return (
          <div class="space-y-6">
            {/* Panel de resumen y accesos rápidos */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-blue-800">Crear Rúbrica</h3>
                    <p class="text-blue-600 text-sm">Nueva rúbrica personalizada</p>
                  </div>
                  <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={handleCreateRubric}
                  class="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Crear Nueva
                </button>
              </div>

              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-green-800">Ver Plantillas</h3>
                    <p class="text-green-600 text-sm">Rúbricas predefinidas</p>
                  </div>
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <a
                  href="/rubrics/list?templates=true"
                  class="mt-3 block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-center"
                >
                  Ver Plantillas
                </a>
              </div>

              <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-purple-800">Mis Rúbricas</h3>
                    <p class="text-purple-600 text-sm">Gestionar existentes</p>
                  </div>
                  <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
                <a
                  href="/rubrics/list"
                  class="mt-3 block w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors text-center"
                >
                  Ver Lista Completa
                </a>
              </div>

              <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-orange-800">Estadísticas</h3>
                    <p class="text-orange-600 text-sm">Resumen de rúbricas</p>
                  </div>
                  <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div class="mt-3 space-y-1">
                  <div class="text-sm text-orange-700">📋 4 plantillas</div>
                  <div class="text-sm text-orange-700">🏗️ 5 rúbricas</div>
                </div>
              </div>
            </div>

            {/* Vista previa rápida */}
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <h2 class="text-lg font-semibold text-gray-800">Vista Rápida</h2>
                  <div class="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowTemplates(false)}
                      class={`px-3 py-1 rounded-md text-sm ${!showTemplates ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      Mis Rúbricas
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTemplates(true)}
                      class={`px-3 py-1 rounded-md text-sm ${showTemplates ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                      Plantillas
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-4">
                <RubricsList
                  projectId={projectId}
                  templatesOnly={showTemplates}
                  onSelectRubric={handleSelectRubric}
                  onCreateRubric={canEditRubrics ? handleCreateRubric : undefined}
                  onEditRubric={canEditRubrics ? handleEditRubric : undefined}
                  onDeleteRubric={canEditRubrics ? handleDeleteRubric : undefined}
                  onDuplicateRubric={canEditRubrics ? handleDuplicateRubric : undefined}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return <div>{renderView()}</div>;
}
