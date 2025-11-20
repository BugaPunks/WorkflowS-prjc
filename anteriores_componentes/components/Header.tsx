import type { JSX } from "preact";
import HeaderMenu from "../islands/HeaderMenu.tsx";
import HeaderNav from "../islands/HeaderNav.tsx";

export function Header(): JSX.Element {
  return (
    <header class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <img src="/logo.svg" width="40" height="40" alt="WorkflowS Logo" class="mr-3" />
          <h1 class="text-2xl font-bold">WorkflowS</h1>
        </div>
        <HeaderMenu />
        <HeaderNav />
      </div>
    </header>
  );
}
