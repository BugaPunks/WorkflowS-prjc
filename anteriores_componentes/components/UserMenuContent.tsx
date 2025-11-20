import type { JSX } from "preact";
import { useSession } from "../hooks/useSession.ts";
import { DropdownMenuItem } from "./ui/dropdown-menu.tsx";

interface User {
  username: string;
  email: string;
}

interface UserMenuContentProps {
  user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps): JSX.Element {
  const { logout } = useSession();

  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
  };

  return (
    <div class="p-2">
      <div class="mb-2 p-2">
        <p class="text-sm font-medium">{user.username}</p>
        <p class="text-xs text-gray-500">{user.email}</p>
      </div>
      <DropdownMenuItem>
        <a href="/profile" class="flex w-full items-center">
          Mi Perfil
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <a href="/settings" class="flex w-full items-center">
          Configuración
        </a>
      </DropdownMenuItem>
      <div class="my-1 h-px bg-gray-200" />
      <DropdownMenuItem>
        <button type="button" onClick={handleLogout} class="flex w-full items-center text-red-600">
          Cerrar Sesión
        </button>
      </DropdownMenuItem>
    </div>
  );
}
