import { type UserStory, UserStoryPriority, UserStoryStatus } from "../../models/userStory.ts";
import DropdownMenu, { type DropdownMenuSection } from "../DropdownMenu.tsx";

interface UserStoryCardProps {
  userStory: UserStory;
  onEdit: (userStory: UserStory) => void;
  onDelete: (userStory: UserStory) => void;
  onAssign?: (userStory: UserStory) => void;
  onAddToSprint?: (userStory: UserStory) => void;
  isProductOwner: boolean;
  isScrumMaster: boolean;
}

export default function UserStoryCard({
  userStory,
  onEdit,
  onDelete,
  onAssign,
  onAddToSprint,
  isProductOwner,
  isScrumMaster,
}: UserStoryCardProps) {
  // Obtener la clase de color para la prioridad
  const getPriorityColorClass = (priority: UserStoryPriority) => {
    switch (priority) {
      case UserStoryPriority.LOW:
        return "bg-blue-100 text-blue-800";
      case UserStoryPriority.MEDIUM:
        return "bg-green-100 text-green-800";
      case UserStoryPriority.HIGH:
        return "bg-yellow-100 text-yellow-800";
      case UserStoryPriority.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obtener el nombre de visualización de la prioridad
  const getPriorityDisplay = (priority: UserStoryPriority) => {
    switch (priority) {
      case UserStoryPriority.LOW:
        return "Baja";
      case UserStoryPriority.MEDIUM:
        return "Media";
      case UserStoryPriority.HIGH:
        return "Alta";
      case UserStoryPriority.CRITICAL:
        return "Crítica";
      default:
        return priority;
    }
  };

  // Obtener la clase de color para el estado
  const getStatusColorClass = (status: UserStoryStatus) => {
    switch (status) {
      case UserStoryStatus.BACKLOG:
        return "bg-gray-100 text-gray-800";
      case UserStoryStatus.PLANNED:
        return "bg-blue-100 text-blue-800";
      case UserStoryStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800";
      case UserStoryStatus.TESTING:
        return "bg-purple-100 text-purple-800";
      case UserStoryStatus.DONE:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obtener el nombre de visualización del estado
  const getStatusDisplay = (status: UserStoryStatus) => {
    switch (status) {
      case UserStoryStatus.BACKLOG:
        return "Backlog";
      case UserStoryStatus.PLANNED:
        return "Planificada";
      case UserStoryStatus.IN_PROGRESS:
        return "En Progreso";
      case UserStoryStatus.TESTING:
        return "En Pruebas";
      case UserStoryStatus.DONE:
        return "Completada";
      default:
        return status;
    }
  };

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Opciones del menú desplegable
  const menuSections: DropdownMenuSection[] = [
    {
      items: [
        {
          label: "Ver detalles",
          href: `/user-stories/${userStory.id}`,
        },
        ...(isProductOwner || isScrumMaster
          ? [
              {
                label: "Editar",
                onClick: () => onEdit(userStory),
              },
            ]
          : []),
        ...(onAssign && (isProductOwner || isScrumMaster)
          ? [
              {
                label: "Asignar desarrollador",
                onClick: () => onAssign(userStory),
              },
            ]
          : []),
        ...(onAddToSprint && isScrumMaster
          ? [
              {
                label: "Añadir a sprint",
                onClick: () => onAddToSprint(userStory),
              },
            ]
          : []),
      ],
    },
    ...(isProductOwner
      ? [
          {
            items: [
              {
                label: "Eliminar",
                isDanger: true,
                onClick: () => onDelete(userStory),
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Cabecera de la tarjeta */}
      <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold text-gray-800 truncate">{userStory.title}</h3>
          <DropdownMenu buttonText="Opciones" sections={menuSections} className="ml-2" />
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div class="p-4">
        <div class="mb-4">
          <p class="text-sm text-gray-600 line-clamp-3">{userStory.description}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500 font-medium">PUNTOS</p>
            <p class="text-sm text-gray-700">{userStory.points || "No estimado"}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">CREADO</p>
            <p class="text-sm text-gray-700">{formatDate(userStory.createdAt)}</p>
          </div>
        </div>

        {/* Sprint asignado si existe */}
        {userStory.sprintId && (
          <div class="mb-4">
            <p class="text-xs text-gray-500 font-medium">SPRINT</p>
            <p class="text-sm text-gray-700">Sprint {userStory.sprintId}</p>
          </div>
        )}
      </div>

      {/* Pie de la tarjeta con acciones */}
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex justify-between items-center mb-2">
          <div class="flex space-x-2">
            <span
              class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColorClass(userStory.priority)}`}
            >
              {getPriorityDisplay(userStory.priority)}
            </span>
            <span
              class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(userStory.status)}`}
            >
              {getStatusDisplay(userStory.status)}
            </span>
          </div>
          <a
            href={`/user-stories/${userStory.id}`}
            class="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Ver detalles
          </a>
        </div>
      </div>
    </div>
  );
}
