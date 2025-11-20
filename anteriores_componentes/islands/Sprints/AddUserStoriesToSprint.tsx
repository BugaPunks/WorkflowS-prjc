import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import type { Sprint } from "../../models/sprint.ts";
import type { UserStory } from "../../models/userStory.ts";
import { addUserStoryToSprint } from "../../services/sprintService.ts";

interface AddUserStoriesToSprintProps {
  sprint: Sprint;
  availableUserStories: UserStory[];
}

export default function AddUserStoriesToSprint({
  sprint,
  availableUserStories,
}: AddUserStoriesToSprintProps) {
  const [selectedUserStories, setSelectedUserStories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manejar cambio en la selección de historias de usuario
  const handleUserStorySelection = (userStoryId: string) => {
    setSelectedUserStories((prev) => {
      if (prev.includes(userStoryId)) {
        return prev.filter((id) => id !== userStoryId);
      }
      return [...prev, userStoryId];
    });
  };

  // Añadir historias de usuario seleccionadas al sprint
  const handleAddUserStories = async () => {
    if (selectedUserStories.length === 0) {
      setError("Por favor, selecciona al menos una historia de usuario.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Añadir cada historia de usuario seleccionada al sprint
      for (const userStoryId of selectedUserStories) {
        await addUserStoryToSprint(sprint.id, userStoryId);
      }

      setSuccessMessage(
        `${selectedUserStories.length} historia(s) de usuario añadida(s) al sprint exitosamente.`
      );
      setSelectedUserStories([]);

      // Redirigir al sprint después de 2 segundos
      setTimeout(() => {
        globalThis.location.href = `/sprints/${sprint.id}`;
      }, 2000);
    } catch (err) {
      console.error("Error al añadir historias de usuario al sprint:", err);
      setError("Error al añadir historias de usuario al sprint. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
          <p class="text-sm mt-1">Redirigiendo al sprint...</p>
        </div>
      )}

      <div class="mb-4">
        <p class="text-gray-600 mb-2">
          Selecciona las historias de usuario que deseas añadir al sprint:
        </p>
        <div class="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setSelectedUserStories(availableUserStories.map((story) => story.id))}
            class="text-blue-600 hover:text-blue-800 text-sm mr-4"
          >
            Seleccionar todas
          </button>
          <button
            type="button"
            onClick={() => setSelectedUserStories([])}
            class="text-blue-600 hover:text-blue-800 text-sm"
          >
            Deseleccionar todas
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {availableUserStories.map((userStory) => (
          <div
            key={userStory.id}
            class={`border rounded-lg p-4 ${
              selectedUserStories.includes(userStory.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <div class="flex items-start">
              <input
                type="checkbox"
                id={`user-story-${userStory.id}`}
                checked={selectedUserStories.includes(userStory.id)}
                onChange={() => handleUserStorySelection(userStory.id)}
                class="mt-1 mr-3"
              />
              <div>
                <label
                  for={`user-story-${userStory.id}`}
                  class="font-medium text-gray-800 cursor-pointer"
                >
                  {userStory.title}
                </label>
                <p class="text-sm text-gray-600 mt-1">{userStory.description}</p>
                <div class="flex items-center mt-2">
                  <span
                    class={`px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                      userStory.priority === "critical"
                        ? "bg-red-100 text-red-800"
                        : userStory.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : userStory.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {userStory.priority.charAt(0).toUpperCase() + userStory.priority.slice(1)}
                  </span>
                  <span class="text-xs text-gray-500">
                    {userStory.points} {userStory.points === 1 ? "punto" : "puntos"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div class="flex justify-between">
        <a
          href={`/sprints/${sprint.id}`}
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
        >
          Cancelar
        </a>
        <Button
          onClick={handleAddUserStories}
          disabled={isLoading || selectedUserStories.length === 0}
          class={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded ${
            isLoading || selectedUserStories.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Añadiendo...
            </span>
          ) : (
            `Añadir ${selectedUserStories.length} historia(s) al sprint`
          )}
        </Button>
      </div>
    </div>
  );
}
