import { useSession } from "../hooks/useSession.ts";

export default function UnauthorizedLogoutButton() {
  const { logout } = useSession();

  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      class="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Cerrar Sesión
    </button>
  );
}
