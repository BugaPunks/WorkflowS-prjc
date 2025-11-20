import { useState } from "preact/hooks";
import FormActions from "../../components/form/FormActions.tsx";
import FormError from "../../components/form/FormError.tsx";
import FormField from "../../components/form/FormField.tsx";
import FormSelect from "../../components/form/FormSelect.tsx";
import FormTextarea from "../../components/form/FormTextarea.tsx";
import { type UserStory, UserStoryPriority, UserStoryStatus } from "../../models/userStory.ts";

interface EditUserStoryFormProps {
  userStory: UserStory;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditUserStoryForm({
  userStory,
  onSuccess,
  onCancel,
}: EditUserStoryFormProps) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    title: userStory.title,
    description: userStory.description,
    acceptanceCriteria: userStory.acceptanceCriteria,
    priority: userStory.priority,
    status: userStory.status,
    points: userStory.points !== undefined ? userStory.points.toString() : "",
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
      const updateData = {
        title: formData.title,
        description: formData.description,
        acceptanceCriteria: formData.acceptanceCriteria,
        priority: formData.priority,
        status: formData.status,
        points: formData.points ? Number(formData.points) : undefined,
      };

      // Enviar solicitud
      const response = await fetch(`/api/user-stories/${userStory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar la historia de usuario");
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

  const statusOptions = [
    { value: UserStoryStatus.BACKLOG, label: "Backlog" },
    { value: UserStoryStatus.PLANNED, label: "Planificada" },
    { value: UserStoryStatus.IN_PROGRESS, label: "En Progreso" },
    { value: UserStoryStatus.TESTING, label: "En Pruebas" },
    { value: UserStoryStatus.DONE, label: "Completada" },
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

      <FormSelect
        id="status"
        name="status"
        label="Estado"
        value={formData.status}
        onChange={handleChange}
        options={statusOptions}
        required
      />

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitText="Actualizar Historia de Usuario"
        submittingText="Actualizando..."
      />
    </form>
  );
}
