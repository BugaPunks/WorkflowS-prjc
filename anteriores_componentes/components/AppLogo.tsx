import type { JSX } from "preact";
import { AppLogoIcon } from "./AppLogoIcon.tsx";

export function AppLogo(): JSX.Element {
  return (
    <>
      <div class="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-md">
        <AppLogoIcon class="size-5 fill-current text-white" />
      </div>
      <div class="ml-1 grid flex-1 text-left text-sm">
        <span class="mb-0.5 truncate leading-none font-semibold">WorkflowS</span>
      </div>
    </>
  );
}
