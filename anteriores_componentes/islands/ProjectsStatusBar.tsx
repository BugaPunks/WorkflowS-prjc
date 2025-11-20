interface ProjectsStatusBarProps {
  projectCount: number;
  isLoading: boolean;
}

export default function ProjectsStatusBar({ projectCount, isLoading }: ProjectsStatusBarProps) {
  return (
    <div class="flex justify-between items-center mb-4 bg-blue-50 p-4 rounded-lg">
      <h2 class="text-xl font-semibold text-blue-800">Proyectos ({projectCount})</h2>
      {isLoading && (
        <div class="flex items-center text-blue-600">
          <svg
            class="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Actualizando...
        </div>
      )}
    </div>
  );
}
