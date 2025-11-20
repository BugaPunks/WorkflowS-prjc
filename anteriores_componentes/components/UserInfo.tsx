import type { JSX } from "preact";

interface User {
  username: string;
  email: string;
}

interface UserInfoProps {
  user: User;
}

export function UserInfo({ user }: UserInfoProps): JSX.Element {
  return (
    <div class="flex items-center">
      <div class="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-full">
        <span class="text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
      </div>
      <div class="ml-2 grid flex-1 text-left text-sm">
        <span class="truncate font-medium">{user.username}</span>
        <span class="truncate text-xs text-gray-500">{user.email}</span>
      </div>
    </div>
  );
}
