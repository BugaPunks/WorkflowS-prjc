interface EmptyProjectsMessageProps {
  isAdmin: boolean;
}

export default function EmptyProjectsMessage({ isAdmin }: EmptyProjectsMessageProps) {
  return (
    <div class="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto mb-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p class="text-xl font-medium">No hay proyectos disponibles</p>
      {isAdmin ? (
        <p class="mt-2">Crea un nuevo proyecto para comenzar</p>
      ) : (
        <p class="mt-2">No tienes proyectos asignados</p>
      )}
    </div>
  );
}
