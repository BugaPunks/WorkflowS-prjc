import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { type Project, ProjectRole } from "../models/project.ts";
import { UserRole } from "../models/user.ts";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

interface AssignProjectFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AssignProjectForm({
  project,
  onSuccess,
  onCancel,
}: AssignProjectFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [projectRole, setProjectRole] = useState<ProjectRole>(ProjectRole.TEAM_MEMBER);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cargar usuarios no administradores
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          throw new Error("Error al cargar los usuarios");
        }

        const data = await response.json();

        // Filtrar usuarios no administradores y que no estén ya asignados al proyecto
        const nonAdminUsers = data.users.filter(
          (user: User) =>
            user.role !== UserRole.ADMIN &&
            !project.members.some((member) => member.userId === user.id)
        );

        setUsers(nonAdminUsers);

        // Seleccionar el primer usuario por defecto si hay alguno
        if (nonAdminUsers.length > 0) {
          setSelectedUser(nonAdminUsers[0].id);
        }
      } catch (err) {
        setError("Error al cargar los usuarios. Por favor, intenta de nuevo.");
        console.error("Error cargando usuarios:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [project]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!selectedUser) {
      setSubmitError("Debes seleccionar un usuario");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/projects/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          projectId: project.id,
          role: projectRole,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al asignar el usuario al proyecto");
        } catch (_e) {
          throw new Error(`Error al asignar el usuario al proyecto: ${response.statusText}`);
        }
      }

      // Llamar a la función de éxito
      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ha ocurrido un error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener el nombre completo del usuario
  const getUserFullName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return user.username;
  };

  return (
    <div>
      <div class="mb-4">
        <h3 class="text-md font-medium text-gray-700">Proyecto: {project.name}</h3>
        <p class="text-sm text-gray-500">{project.description || "Sin descripción"}</p>
      </div>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div class="flex justify-center items-center py-8">
          <svg
            class="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      ) : users.length === 0 ? (
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No hay usuarios disponibles para asignar a este proyecto.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} class="space-y-4">
          {submitError && (
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{submitError}</p>
            </div>
          )}

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
              Usuario*
            </label>
            <select
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="userId"
              name="userId"
              value={selectedUser}
              onChange={(e) => setSelectedUser((e.target as HTMLSelectElement).value)}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserFullName(user)} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Rol en el Proyecto*
            </label>
            <select
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="role"
              name="role"
              value={projectRole}
              onChange={(e) => setProjectRole((e.target as HTMLSelectElement).value as ProjectRole)}
              required
            >
              <option value={ProjectRole.PRODUCT_OWNER}>Product Owner</option>
              <option value={ProjectRole.SCRUM_MASTER}>Scrum Master</option>
              <option value={ProjectRole.TEAM_MEMBER}>Miembro del Equipo</option>
            </select>
          </div>

          <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-6">
            <Button
              type="button"
              onClick={onCancel}
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2 border border-gray-400"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              class={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Asignando..." : "Asignar Usuario"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
