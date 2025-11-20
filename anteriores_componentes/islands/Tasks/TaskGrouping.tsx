import { useState } from "preact/hooks";

export type GroupingOption = "status" | "project" | "userStory" | "priority" | "dueDate" | "none";

interface TaskGroupingProps {
  initialGrouping: GroupingOption;
  onGroupingChange: (grouping: GroupingOption) => void;
}

export default function TaskGrouping({ initialGrouping, onGroupingChange }: TaskGroupingProps) {
  const [grouping, setGrouping] = useState<GroupingOption>(initialGrouping);

  // Manejar cambio de agrupación
  const handleGroupingChange = (option: GroupingOption) => {
    setGrouping(option);
    onGroupingChange(option);
  };

  // Definir opciones de agrupación con sus etiquetas y descripciones
  const groupingOptions: {
    value: GroupingOption;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: "status",
      label: "Estado",
      description: "Agrupa tareas por su estado actual",
      icon: "📊",
    },
    {
      value: "project",
      label: "Proyecto",
      description: "Agrupa tareas por proyecto",
      icon: "📁",
    },
    {
      value: "userStory",
      label: "Historia de Usuario",
      description: "Agrupa tareas por historia de usuario",
      icon: "📝",
    },
    {
      value: "priority",
      label: "Prioridad",
      description: "Agrupa tareas por nivel de prioridad",
      icon: "🔥",
    },
    {
      value: "dueDate",
      label: "Fecha límite",
      description: "Agrupa tareas por fecha de vencimiento",
      icon: "📅",
    },
    {
      value: "none",
      label: "Sin agrupar",
      description: "Muestra todas las tareas sin agrupar",
      icon: "📋",
    },
  ];

  return (
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">Visualización</h2>
        <p class="text-sm text-gray-600">Elige cómo quieres organizar tus tareas</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {groupingOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleGroupingChange(option.value)}
            class={`flex items-start p-3 rounded-lg text-left transition-colors ${
              grouping === option.value
                ? "bg-blue-50 border border-blue-200 ring-2 ring-blue-300"
                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div class="mr-3 text-xl">{option.icon}</div>
            <div>
              <div
                class={`font-medium ${grouping === option.value ? "text-blue-700" : "text-gray-700"}`}
              >
                {option.label}
              </div>
              <div class="text-xs text-gray-500 mt-1">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
