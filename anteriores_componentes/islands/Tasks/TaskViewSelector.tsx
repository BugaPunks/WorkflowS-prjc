import { useState } from "preact/hooks";

export type ViewType = "cards" | "list" | "calendar";

interface TaskViewSelectorProps {
  initialView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function TaskViewSelector({ initialView, onViewChange }: TaskViewSelectorProps) {
  const [activeView, setActiveView] = useState<ViewType>(initialView);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    onViewChange(view);
  };

  return (
    <div class="flex space-x-2">
      <button
        type="button"
        onClick={() => handleViewChange("cards")}
        class={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
          activeView === "cards"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Ver como tarjetas"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          role="img"
        >
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleViewChange("list")}
        class={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
          activeView === "list"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Ver como lista"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          role="img"
        >
          <path
            fill-rule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleViewChange("calendar")}
        class={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
          activeView === "calendar"
            ? "bg-blue-100 text-blue-800 border border-blue-300"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
        }`}
        title="Ver como calendario"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          role="img"
        >
          <path
            fill-rule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
