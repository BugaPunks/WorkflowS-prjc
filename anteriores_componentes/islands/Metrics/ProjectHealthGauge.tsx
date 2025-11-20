import { useEffect, useState } from "preact/hooks";

interface ProjectHealthData {
  score: number;
  status: "excellent" | "good" | "fair" | "poor" | "critical";
  timestamp: number;
}

interface ProjectHealthGaugeProps {
  projectId: string;
  size?: number;
  refreshInterval?: number; // en milisegundos, 0 para desactivar
}

export default function ProjectHealthGauge({
  projectId,
  size = 200,
  refreshInterval = 0,
}: ProjectHealthGaugeProps) {
  const [data, setData] = useState<ProjectHealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los datos
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/health`);

      if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.status}`);
      }

      const healthData = await response.json();
      setData(healthData);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos de salud del proyecto:", err);
      setError("No se pudieron cargar los datos de salud del proyecto");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();

    // Configurar intervalo de actualización si es necesario
    if (refreshInterval > 0) {
      const intervalId = setInterval(loadData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [projectId, refreshInterval]);

  // Si está cargando, mostrar spinner
  if (loading && !data) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Salud del Proyecto</h3>
        <div class="flex justify-center items-center" style={{ height: `${size}px` }}>
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Salud del Proyecto</h3>
        <div class="flex justify-center items-center" style={{ height: `${size}px` }}>
          <div class="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!data) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Salud del Proyecto</h3>
        <div class="flex justify-center items-center" style={{ height: `${size}px` }}>
          <div class="text-gray-500">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  // Calcular colores y mensajes según el estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "excellent":
        return "#48BB78"; // green-500
      case "good":
        return "#4299E1"; // blue-500
      case "fair":
        return "#ECC94B"; // yellow-500
      case "poor":
        return "#ED8936"; // orange-500
      case "critical":
        return "#F56565"; // red-500
      default:
        return "#A0AEC0"; // gray-500
    }
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bueno";
      case "fair":
        return "Regular";
      case "poor":
        return "Deficiente";
      case "critical":
        return "Crítico";
      default:
        return "Desconocido";
    }
  };

  // Calcular ángulos para el medidor
  const startAngle = -Math.PI * 0.75; // -135 grados
  const endAngle = Math.PI * 0.75; // 135 grados
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (data.score / 100) * totalAngle;

  // Calcular coordenadas para el arco
  const radius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calcular puntos para el arco de fondo
  const backgroundArc = describeArc(centerX, centerY, radius, startAngle, endAngle);

  // Calcular puntos para el arco de valor
  const valueArc = describeArc(centerX, centerY, radius, startAngle, scoreAngle);

  // Calcular coordenadas para la aguja
  const needleLength = radius * 0.9;
  const needleX = centerX + Math.cos(scoreAngle) * needleLength;
  const needleY = centerY + Math.sin(scoreAngle) * needleLength;

  return (
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Salud del Proyecto</h3>

      <div class="flex flex-col items-center">
        <svg width={size} height={size}>
          {/* Arco de fondo */}
          <path d={backgroundArc} fill="none" stroke="#E2E8F0" stroke-width="10" />

          {/* Arco de valor */}
          <path d={valueArc} fill="none" stroke={getStatusColor(data.status)} stroke-width="10" />

          {/* Marcas de escala */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = startAngle + (i / 5) * totalAngle;
            const x1 = centerX + Math.cos(angle) * (radius - 5);
            const y1 = centerY + Math.sin(angle) * (radius - 5);
            const x2 = centerX + Math.cos(angle) * (radius + 5);
            const y2 = centerY + Math.sin(angle) * (radius + 5);

            return (
              <line
                key={`mark-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#718096"
                stroke-width="2"
              />
            );
          })}

          {/* Etiquetas de escala */}
          {Array.from({ length: 6 }).map((_, i) => {
            const value = i * 20;
            const angle = startAngle + (i / 5) * totalAngle;
            const x = centerX + Math.cos(angle) * (radius + 20);
            const y = centerY + Math.sin(angle) * (radius + 20);

            return (
              <text
                key={`label-${i}`}
                x={x}
                y={y}
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="12"
                fill="#4A5568"
              >
                {value}
              </text>
            );
          })}

          {/* Centro del medidor */}
          <circle cx={centerX} cy={centerY} r="10" fill="#4A5568" />

          {/* Aguja */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#4A5568"
            stroke-width="2"
          />

          {/* Punta de la aguja */}
          <circle cx={needleX} cy={needleY} r="5" fill={getStatusColor(data.status)} />
        </svg>

        <div class="mt-4 text-center">
          <div class="text-3xl font-bold" style={{ color: getStatusColor(data.status) }}>
            {data.score}
          </div>
          <div class="text-lg font-medium" style={{ color: getStatusColor(data.status) }}>
            {getStatusMessage(data.status)}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            Actualizado: {new Date(data.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Botón de actualización */}
      <div class="mt-2 text-right">
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          class="text-sm text-blue-500 hover:text-blue-700"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>
    </div>
  );
}

// Función auxiliar para describir un arco SVG
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = {
    x: x + Math.cos(startAngle) * radius,
    y: y + Math.sin(startAngle) * radius,
  };

  const end = {
    x: x + Math.cos(endAngle) * radius,
    y: y + Math.sin(endAngle) * radius,
  };

  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");
}
