import { useEffect, useState } from "preact/hooks";
import type { UserStory } from "../../models/userStory.ts";
import DropdownMenu from "../DropdownMenu.tsx";

interface BacklogItemCardProps {
  userStory: UserStory;
  onEdit: (userStory: UserStory) => void;
  onDelete: (userStory: UserStory) => void;
  onMoveToSprint: (userStory: UserStory) => void;
  onDragStart: (userStory: UserStory) => void;
  onDragEnd: () => void;
  isProductOwner: boolean;
  isAdmin: boolean;
}

export default function BacklogItemCard({
  userStory,
  onEdit,
  onDelete,
  onMoveToSprint,
  onDragStart,
  onDragEnd,
  isProductOwner,
  isAdmin,
}: BacklogItemCardProps) {
  // Estado para controlar si el elemento está siendo arrastrado
  const [isDragging, setIsDragging] = useState(false);

  // Función para manejar el inicio del arrastre
  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart(userStory);
  };

  // Función para manejar el fin del arrastre
  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  // Cargar estilos CSS para drag & drop
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/backlog-drag-drop.css";
    document.head.appendChild(link);

    return () => {
      // Limpiar el link cuando el componente se desmonte
      const existingLink = document.querySelector('link[href="/css/backlog-drag-drop.css"]');
      existingLink?.parentNode?.removeChild(existingLink);
    };
  }, []);
  // Formatear fecha
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Obtener clase CSS para los puntos de historia
  const getPointsClass = (points: number): string => {
    // Fibonacci: 1, 2, 3, 5, 8, 13, 21
    if ([1, 2, 3, 5, 8, 13, 21].includes(points)) {
      return `story-points-${points}`;
    }
    return "story-points-default";
  };

  // Configurar opciones del menú desplegable
  const menuItems = [];

  // Opción para ver detalles
  menuItems.push({
    label: "Ver detalles",
    href: `/user-stories/${userStory.id}`,
  });

  // Opciones para Product Owner y Admin
  if (isProductOwner || isAdmin) {
    menuItems.push({
      label: "Editar",
      onClick: () => onEdit(userStory),
    });

    menuItems.push({
      label: "Mover a Sprint",
      onClick: () => onMoveToSprint(userStory),
    });

    menuItems.push({
      label: "Eliminar",
      isDanger: true,
      onClick: () => onDelete(userStory),
    });
  }

  const menuSections = [{ items: menuItems }];

  return (
    <div
      class={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 backlog-item ${isDragging ? "backlog-item-dragging" : ""}`}
      draggable={isProductOwner || isAdmin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div class="p-3">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-md font-medium text-gray-800 truncate">{userStory.title}</h3>
          <DropdownMenu
            buttonText=""
            buttonIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                role="img"
              >
                <title>Menú de opciones</title>
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            }
            sections={menuSections}
            align="right"
            className="ml-2"
          />
        </div>

        <p class="text-sm text-gray-600 line-clamp-2 mb-2">{userStory.description}</p>

        <div class="flex justify-between items-center text-xs text-gray-500">
          <div>
            {userStory.points !== undefined && (
              <span
                class={`story-points ${getPointsClass(userStory.points)} mr-2`}
                title="Puntos de historia"
              >
                {userStory.points}
              </span>
            )}
            <span>Creado: {formatDate(userStory.createdAt)}</span>
          </div>

          {(isProductOwner || isAdmin) && (
            <div class="text-gray-400 text-xs italic">Arrastra para cambiar prioridad</div>
          )}
        </div>
      </div>
    </div>
  );
}
