import { useState } from "preact/hooks";
import FormActions from "../../components/form/FormActions.tsx";
import FormError from "../../components/form/FormError.tsx";
import FormField from "../../components/form/FormField.tsx";
import FormSelect from "../../components/form/FormSelect.tsx";
import FormTextarea from "../../components/form/FormTextarea.tsx";
import type { Project } from "../../models/project.ts";
import { type CreateUserStoryData, UserStoryPriority } from "../../models/userStory.ts";

interface CreateUserStoryFormProps {
  projectId?: string;
  projects: Project[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateUserStoryForm({
  projectId,
  projects,
  onSuccess,
  onCancel,
}: CreateUserStoryFormProps) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    acceptanceCriteria: "",
    priority: UserStoryPriority.MEDIUM.toString(),
    points: "",
    projectId: projectId || "",
  });

  // Estado de errores y envío
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value } = target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar error cuando se edita el campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Limpiar error general
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (!formData.acceptanceCriteria.trim()) {
      newErrors.acceptanceCriteria = "Los criterios de aceptación son obligatorios";
    }

    if (!projectId && !formData.projectId) {
      newErrors.projectId = "Debes seleccionar un proyecto";
    }

    if (formData.points && (Number.isNaN(Number(formData.points)) || Number(formData.points) < 0)) {
      newErrors.points = "Los puntos deben ser un número positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Validar el formulario
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Preparar datos para enviar
      const createData: CreateUserStoryData = {
        title: formData.title,
        description: formData.description,
        acceptanceCriteria: formData.acceptanceCriteria,
        priority: formData.priority as UserStoryPriority,
        points: formData.points ? Number(formData.points) : undefined,
        projectId: projectId || formData.projectId,
      };

      // Enviar solicitud
      const response = await fetch("/api/user-stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la historia de usuario");
      }

      // Notificar éxito
      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones para los selectores
  const priorityOptions = [
    { value: UserStoryPriority.LOW, label: "Baja" },
    { value: UserStoryPriority.MEDIUM, label: "Media" },
    { value: UserStoryPriority.HIGH, label: "Alta" },
    { value: UserStoryPriority.CRITICAL, label: "Crítica" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <FormError error={submitError} />

      <FormField
        id="title"
        name="title"
        label="Título"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Como [usuario], quiero [acción] para [beneficio]"
      />

      <FormTextarea
        id="description"
        name="description"
        label="Descripción"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        placeholder="Describe la funcionalidad desde la perspectiva del usuario"
        rows={4}
      />

      <FormTextarea
        id="acceptanceCriteria"
        name="acceptanceCriteria"
        label="Criterios de Aceptación"
        value={formData.acceptanceCriteria}
        onChange={handleChange}
        error={errors.acceptanceCriteria}
        required
        placeholder="Lista los criterios que deben cumplirse para considerar la historia como completada"
        rows={4}
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          id="priority"
          name="priority"
          label="Prioridad"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
          required
        />

        <FormField
          id="points"
          name="points"
          label="Puntos de Historia"
          type="number"
          value={formData.points}
          onChange={handleChange}
          error={errors.points}
          placeholder="Estimación de complejidad (opcional)"
          min="0"
        />
      </div>

      {!projectId && (
        <FormSelect
          id="projectId"
          name="projectId"
          label="Proyecto"
          value={formData.projectId}
          onChange={handleChange}
          error={errors.projectId}
          required
          options={[
            { value: "", label: "Selecciona un proyecto" },
            ...projects.map((project) => ({
              value: project.id,
              label: project.name,
            })),
          ]}
        />
      )}

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitText="Crear Historia de Usuario"
        submittingText="Creando..."
      />
    </form>
  );
}
