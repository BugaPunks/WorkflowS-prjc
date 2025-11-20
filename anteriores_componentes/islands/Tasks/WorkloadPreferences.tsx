import { useEffect, useState } from "preact/hooks";

interface WorkloadPreferencesProps {
  onClose: () => void;
}

interface Preferences {
  defaultView: "daily" | "weekly" | "byProject" | "byStatus";
  showMetrics: boolean;
  showExport: boolean;
  daysToShow: number;
}

export default function WorkloadPreferences({ onClose }: WorkloadPreferencesProps) {
  // Estado para las preferencias
  const [preferences, setPreferences] = useState<Preferences>({
    defaultView: "daily",
    showMetrics: true,
    showExport: true,
    daysToShow: 7,
  });

  // Cargar preferencias al montar el componente
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("workloadPreferences");
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    }
  }, []);

  // Manejar cambios en las preferencias
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const name = target.name;
    let value: string | number | boolean = target.value;

    // Convertir a booleano si es un checkbox
    if (target.type === "checkbox") {
      value = (target as HTMLInputElement).checked;
    }

    // Convertir a número si es un campo numérico
    if (target.type === "number") {
      value = Number.parseInt(target.value, 10);
    }

    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Guardar preferencias
  const handleSave = () => {
    try {
      localStorage.setItem("workloadPreferences", JSON.stringify(preferences));

      // Actualizar la vista predeterminada
      localStorage.setItem("workloadViewMode", preferences.defaultView);

      onClose();

      // Recargar la página para aplicar los cambios
      globalThis.location.reload();
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
    }
  };

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Preferencias de Visualización</h3>
          <button type="button" onClick={onClose} class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="defaultView">
              Vista predeterminada
            </label>
            <select
              id="defaultView"
              name="defaultView"
              value={preferences.defaultView}
              onChange={handleChange}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="byProject">Por Proyecto</option>
              <option value="byStatus">Por Estado</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" htmlFor="daysToShow">
              Días a mostrar
            </label>
            <input
              type="number"
              id="daysToShow"
              name="daysToShow"
              min="1"
              max="30"
              value={preferences.daysToShow}
              onChange={handleChange}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              Número de días a mostrar en la vista diaria (1-30)
            </p>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              id="showMetrics"
              name="showMetrics"
              checked={preferences.showMetrics}
              onChange={handleChange}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-700" htmlFor="showMetrics">
              Mostrar métricas de carga de trabajo
            </label>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              id="showExport"
              name="showExport"
              checked={preferences.showExport}
              onChange={handleChange}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-700" htmlFor="showExport">
              Mostrar opciones de exportación
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
