import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import FormError from "../../components/form/FormError.tsx";
import {
  type Rubric,
  type RubricCriterion,
  type RubricCriterionLevel,
  RubricStatus,
  createRubricWithDefaults,
} from "../../models/rubric.ts";

interface RubricFormProps {
  rubricId?: string;
  projectId?: string;
  isTemplate?: boolean;
  onSave: (rubric: Rubric) => void;
  onCancel: () => void;
}

export default function RubricForm({
  rubricId,
  projectId,
  isTemplate = false,
  onSave,
  onCancel,
}: RubricFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estado del formulario
  const [rubric, setRubric] = useState<Rubric>(() => {
    return createRubricWithDefaults({
      projectId,
      isTemplate,
    });
  });

  // Cargar rúbrica existente si se proporciona un ID
  useEffect(() => {
    if (!rubricId) return;

    const fetchRubric = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/rubrics/${rubricId}`);

        if (!response.ok) {
          throw new Error(`Error al cargar la rúbrica: ${response.statusText}`);
        }

        const data = await response.json();
        setRubric(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar la rúbrica";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRubric();
  }, [rubricId]);

  // Manejar cambios en los campos básicos
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;

    setRubric((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambios en los criterios
  const handleCriterionChange = (
    index: number,
    field: keyof RubricCriterion,
    value: string | number
  ) => {
    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      newCriteria[index] = {
        ...newCriteria[index],
        [field]: value,
      };
      return {
        ...prev,
        criteria: newCriteria,
      };
    });
  };

  // Manejar cambios en los niveles de un criterio
  const handleLevelChange = (
    criterionIndex: number,
    levelIndex: number,
    field: keyof RubricCriterionLevel,
    value: string | number
  ) => {
    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      const newLevels = [...newCriteria[criterionIndex].levels];
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        [field]: field === "pointValue" ? Number(value) : value,
      };
      newCriteria[criterionIndex] = {
        ...newCriteria[criterionIndex],
        levels: newLevels,
      };
      return {
        ...prev,
        criteria: newCriteria,
      };
    });
  };

  // Añadir un nuevo criterio
  const addCriterion = () => {
    setRubric((prev) => {
      const newCriterion: RubricCriterion = {
        id: crypto.randomUUID(),
        name: `Criterio ${prev.criteria.length + 1}`,
        description: "",
        maxPoints: 10,
        levels: [
          {
            id: crypto.randomUUID(),
            description: "Excelente",
            pointValue: 10,
          },
          {
            id: crypto.randomUUID(),
            description: "Bueno",
            pointValue: 7,
          },
          {
            id: crypto.randomUUID(),
            description: "Regular",
            pointValue: 4,
          },
          {
            id: crypto.randomUUID(),
            description: "Insuficiente",
            pointValue: 1,
          },
        ],
      };

      return {
        ...prev,
        criteria: [...prev.criteria, newCriterion],
      };
    });
  };

  // Eliminar un criterio
  const removeCriterion = (index: number) => {
    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      newCriteria.splice(index, 1);
      return {
        ...prev,
        criteria: newCriteria,
      };
    });
  };

  // Añadir un nuevo nivel a un criterio
  const addLevel = (criterionIndex: number) => {
    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      const criterion = newCriteria[criterionIndex];
      const newLevels = [...criterion.levels];

      newLevels.push({
        id: crypto.randomUUID(),
        description: `Nivel ${newLevels.length + 1}`,
        pointValue: 0,
      });

      newCriteria[criterionIndex] = {
        ...criterion,
        levels: newLevels,
      };

      return {
        ...prev,
        criteria: newCriteria,
      };
    });
  };

  // Eliminar un nivel de un criterio
  const removeLevel = (criterionIndex: number, levelIndex: number) => {
    setRubric((prev) => {
      const newCriteria = [...prev.criteria];
      const criterion = newCriteria[criterionIndex];
      const newLevels = [...criterion.levels];

      newLevels.splice(levelIndex, 1);

      newCriteria[criterionIndex] = {
        ...criterion,
        levels: newLevels,
      };

      return {
        ...prev,
        criteria: newCriteria,
      };
    });
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validar campos básicos
    if (!rubric.name.trim()) {
      errors.name = "El nombre es requerido";
    }

    // Validar criterios
    if (rubric.criteria.length === 0) {
      errors.criteria = "Debe haber al menos un criterio";
    } else {
      rubric.criteria.forEach((criterion, index) => {
        if (!criterion.name.trim()) {
          errors[`criterion_${index}_name`] = "El nombre del criterio es requerido";
        }

        if (criterion.maxPoints <= 0) {
          errors[`criterion_${index}_maxPoints`] = "Los puntos máximos deben ser mayores a 0";
        }

        if (criterion.levels.length === 0) {
          errors[`criterion_${index}_levels`] = "Debe haber al menos un nivel";
        } else {
          criterion.levels.forEach((level, levelIndex) => {
            if (!level.description.trim()) {
              errors[`criterion_${index}_level_${levelIndex}_description`] =
                "La descripción del nivel es requerida";
            }

            if (level.pointValue < 0) {
              errors[`criterion_${index}_level_${levelIndex}_pointValue`] =
                "Los puntos deben ser mayores o iguales a 0";
            }
          });
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar la rúbrica
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = rubricId ? `/api/rubrics/${rubricId}` : "/api/rubrics";
      const method = rubricId ? "PUT" : "POST";

      // Obtener la sesión actual para asegurar que tenemos el userId
      const sessionResponse = await fetch("/api/auth/session");
      if (!sessionResponse.ok) {
        throw new Error("No se pudo obtener la información de sesión");
      }
      
      const sessionData = await sessionResponse.json();
      
      // Preparar los datos para enviar
      const rubricToSend = {
        ...rubric,
        createdBy: sessionData.userId,
        // Asegurarse de que projectId sea undefined en lugar de null si no está presente
        projectId: rubric.projectId || undefined
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rubricToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || `Error al guardar la rúbrica: ${response.statusText}`);
      }

      const savedRubric = await response.json();
      onSave(savedRubric);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar la rúbrica";
      setError(errorMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p class="mt-2 text-gray-600">Cargando rúbrica...</p>
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-6">
        {rubricId ? "Editar Rúbrica" : "Nueva Rúbrica"}
      </h2>

      <form onSubmit={handleSubmit}>
        {error && <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div class="space-y-4 mb-6">
          {/* Campos básicos */}
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre{<span class="text-red-500 ml-1">*</span>}
            </label>
            <input
              class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formErrors.name ? "border-red-500" : ""
              }`}
              id="name"
              name="name"
              type="text"
              value={rubric.name}
              onChange={handleChange}
              required
            />
            {formErrors.name && <p class="text-red-500 text-xs italic mt-1">{formErrors.name}</p>}
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Descripción
            </label>
            <textarea
              class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formErrors.description ? "border-red-500" : ""
              }`}
              id="description"
              name="description"
              value={rubric.description || ""}
              onChange={handleChange}
              rows={3}
            />
            {formErrors.description && (
              <p class="text-red-500 text-xs italic mt-1">{formErrors.description}</p>
            )}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                Estado
              </label>
              <select
                class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formErrors.status ? "border-red-500" : ""
                }`}
                id="status"
                name="status"
                value={rubric.status}
                onChange={handleChange}
              >
                <option value={RubricStatus.DRAFT}>Borrador</option>
                <option value={RubricStatus.ACTIVE}>Activa</option>
                <option value={RubricStatus.ARCHIVED}>Archivada</option>
              </select>
              {formErrors.status && (
                <p class="text-red-500 text-xs italic mt-1">{formErrors.status}</p>
              )}
            </div>

            <div class="flex items-center mt-8">
              <input
                type="checkbox"
                id="isTemplate"
                name="isTemplate"
                checked={rubric.isTemplate}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  setRubric((prev) => ({
                    ...prev,
                    isTemplate: target.checked,
                  }));
                }}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="isTemplate" class="ml-2 block text-sm text-gray-900">
                Usar como plantilla
              </label>
            </div>
          </div>
        </div>

        {/* Criterios */}
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-800">Criterios de Evaluación</h3>
            <Button type="button" onClick={addCriterion}>
              Añadir Criterio
            </Button>
          </div>

          {formErrors.criteria && <FormError error={formErrors.criteria} />}

          {rubric.criteria.length === 0 ? (
            <div class="text-center p-6 bg-gray-50 rounded-lg">
              <p class="text-gray-500 mb-4">No hay criterios definidos.</p>
              <Button type="button" onClick={addCriterion}>
                Añadir Primer Criterio
              </Button>
            </div>
          ) : (
            <div class="space-y-6">
              {rubric.criteria.map((criterion, criterionIndex) => (
                <div key={criterion.id} class="border border-gray-200 rounded-lg p-4">
                  <div class="flex justify-between items-start mb-4">
                    <h4 class="text-md font-medium text-gray-800">Criterio {criterionIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterionIndex)}
                      class="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div class="space-y-4 mb-6">
                    <div class="mb-4">
                      <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor={`criterion_${criterionIndex}_name`}
                      >
                        Nombre del criterio{<span class="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                          formErrors[`criterion_${criterionIndex}_name`] ? "border-red-500" : ""
                        }`}
                        id={`criterion_${criterionIndex}_name`}
                        name={`criterion_${criterionIndex}_name`}
                        type="text"
                        value={criterion.name}
                        onChange={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          handleCriterionChange(criterionIndex, "name", target.value);
                        }}
                        required
                      />
                      {formErrors[`criterion_${criterionIndex}_name`] && (
                        <p class="text-red-500 text-xs italic mt-1">
                          {formErrors[`criterion_${criterionIndex}_name`]}
                        </p>
                      )}
                    </div>

                    <div class="mb-4">
                      <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor={`criterion_${criterionIndex}_description`}
                      >
                        Descripción del criterio
                      </label>
                      <textarea
                        class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                          formErrors[`criterion_${criterionIndex}_description`]
                            ? "border-red-500"
                            : ""
                        }`}
                        id={`criterion_${criterionIndex}_description`}
                        name={`criterion_${criterionIndex}_description`}
                        value={criterion.description || ""}
                        onChange={(e: Event) => {
                          const target = e.target as HTMLTextAreaElement;
                          handleCriterionChange(criterionIndex, "description", target.value);
                        }}
                        rows={2}
                      />
                      {formErrors[`criterion_${criterionIndex}_description`] && (
                        <p class="text-red-500 text-xs italic mt-1">
                          {formErrors[`criterion_${criterionIndex}_description`]}
                        </p>
                      )}
                    </div>

                    <div class="mb-4">
                      <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor={`criterion_${criterionIndex}_maxPoints`}
                      >
                        Puntos máximos{<span class="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                          formErrors[`criterion_${criterionIndex}_maxPoints`]
                            ? "border-red-500"
                            : ""
                        }`}
                        id={`criterion_${criterionIndex}_maxPoints`}
                        name={`criterion_${criterionIndex}_maxPoints`}
                        type="number"
                        min="1"
                        value={criterion.maxPoints.toString()}
                        onChange={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          handleCriterionChange(criterionIndex, "maxPoints", Number(target.value));
                        }}
                        required
                      />
                      {formErrors[`criterion_${criterionIndex}_maxPoints`] && (
                        <p class="text-red-500 text-xs italic mt-1">
                          {formErrors[`criterion_${criterionIndex}_maxPoints`]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Niveles */}
                  <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                      <h5 class="text-sm font-medium text-gray-700">Niveles de Desempeño</h5>
                      <button
                        type="button"
                        onClick={() => addLevel(criterionIndex)}
                        class="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Añadir Nivel
                      </button>
                    </div>

                    {formErrors[`criterion_${criterionIndex}_levels`] && (
                      <FormError error={formErrors[`criterion_${criterionIndex}_levels`]} />
                    )}

                    {criterion.levels.length === 0 ? (
                      <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <p class="text-gray-500 mb-2">No hay niveles definidos.</p>
                        <button
                          type="button"
                          onClick={() => addLevel(criterionIndex)}
                          class="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Añadir Primer Nivel
                        </button>
                      </div>
                    ) : (
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                          <thead class="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Nivel
                              </th>
                              <th
                                scope="col"
                                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Descripción
                              </th>
                              <th
                                scope="col"
                                class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Puntos
                              </th>
                              <th
                                scope="col"
                                class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody class="bg-white divide-y divide-gray-200">
                            {criterion.levels.map((level, levelIndex) => (
                              <tr key={level.id}>
                                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  Nivel {levelIndex + 1}
                                </td>
                                <td class="px-3 py-2">
                                  <input
                                    type="text"
                                    value={level.description}
                                    onChange={(e) => {
                                      const target = e.target as HTMLInputElement;
                                      handleLevelChange(
                                        criterionIndex,
                                        levelIndex,
                                        "description",
                                        target.value
                                      );
                                    }}
                                    class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                  />
                                  {formErrors[
                                    `criterion_${criterionIndex}_level_${levelIndex}_description`
                                  ] && (
                                    <p class="mt-1 text-xs text-red-600">
                                      {
                                        formErrors[
                                          `criterion_${criterionIndex}_level_${levelIndex}_description`
                                        ]
                                      }
                                    </p>
                                  )}
                                </td>
                                <td class="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={level.pointValue}
                                    onChange={(e) => {
                                      const target = e.target as HTMLInputElement;
                                      handleLevelChange(
                                        criterionIndex,
                                        levelIndex,
                                        "pointValue",
                                        Number(target.value)
                                      );
                                    }}
                                    class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                  />
                                  {formErrors[
                                    `criterion_${criterionIndex}_level_${levelIndex}_pointValue`
                                  ] && (
                                    <p class="mt-1 text-xs text-red-600">
                                      {
                                        formErrors[
                                          `criterion_${criterionIndex}_level_${levelIndex}_pointValue`
                                        ]
                                      }
                                    </p>
                                  )}
                                </td>
                                <td class="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeLevel(criterionIndex, levelIndex)}
                                    class="text-red-600 hover:text-red-800"
                                    disabled={criterion.levels.length <= 1}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-6">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving} class="ml-2">
            {saving ? "Guardando..." : rubricId ? "Actualizar Rúbrica" : "Crear Rúbrica"}
          </Button>
        </div>
      </form>
    </div>
  );
}
