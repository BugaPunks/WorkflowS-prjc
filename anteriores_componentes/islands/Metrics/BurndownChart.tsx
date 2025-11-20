import { useEffect, useState } from "preact/hooks";

interface BurndownData {
  date: string;
  remaining: number;
  ideal: number;
  completed: number;
}

interface BurndownChartProps {
  sprintId: string;
  refreshInterval?: number; // en milisegundos, 0 para desactivar
  height?: number;
  width?: number;
}

export default function BurndownChart({
  sprintId,
  refreshInterval = 0,
  height = 300,
  width = 600,
}: BurndownChartProps) {
  const [data, setData] = useState<BurndownData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  // Función para cargar los datos
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sprints/${sprintId}/burndown`, {
        credentials: 'same-origin', // Incluir cookies de sesión
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error de API:", errorData);
        throw new Error(`Error al cargar datos: ${response.status} - ${errorData.error || 'Error desconocido'}`);
      }

      const burndownData = await response.json();
      console.log("Datos de burndown recibidos:", burndownData);
      setData(burndownData);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos de burndown:", err);
      setError("No se pudieron cargar los datos del gráfico de burndown");
    } finally {
      setLoading(false);
    }
  };

  // Función para recalcular el burndown
  const recalculateBurndown = async () => {
    try {
      setRecalculating(true);
      const response = await fetch(`/api/sprints/${sprintId}/recalculate-burndown`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al recalcular burndown:", errorData);
        throw new Error(`Error al recalcular: ${response.status} - ${errorData.error || 'Error desconocido'}`);
      }

      const result = await response.json();
      console.log("Burndown recalculado:", result);

      // Recargar los datos después de recalcular
      await loadData();
    } catch (err) {
      console.error("Error al recalcular burndown:", err);
      setError("No se pudo recalcular el gráfico de burndown");
    } finally {
      setRecalculating(false);
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
  }, [sprintId, refreshInterval]);

  // Si está cargando, mostrar spinner
  if (loading && !data) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Gráfico de Burndown</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Gráfico de Burndown</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar datos de ejemplo
  if (!data || data.length === 0) {
    // Generar datos de ejemplo para demostración
    const demoData: BurndownData[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 10); // Sprint comenzó hace 10 días
    
    const totalPoints = 26; // Puntos totales de ejemplo
    const sprintDuration = 14; // Duración del sprint en días
    const idealBurndownPerDay = totalPoints / sprintDuration;
    
    // Generar datos para los últimos 10 días
    for (let day = 0; day <= 10; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // Calcular puntos restantes (con algo de variación aleatoria)
      const idealRemaining = totalPoints - (day * idealBurndownPerDay);
      const randomFactor = Math.random() * 0.2 - 0.1; // Entre -10% y +10%
      const remaining = Math.max(0, idealRemaining * (1 + randomFactor));
      
      // Calcular puntos completados
      const completed = totalPoints - remaining;
      
      demoData.push({
        date: currentDate.toISOString().split('T')[0],
        remaining: Math.round(remaining * 10) / 10,
        ideal: Math.round(idealRemaining * 10) / 10,
        completed: Math.round(completed * 10) / 10
      });
    }
    
    // Usar los datos de ejemplo
    setData(demoData);
    
    // Mostrar mensaje de que son datos de ejemplo
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Gráfico de Burndown (Datos de ejemplo)</h3>
        <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded mb-4">
          <p>Mostrando datos de ejemplo. No hay datos reales disponibles para este sprint.</p>
        </div>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="text-gray-500">Cargando datos de ejemplo...</div>
        </div>
      </div>
    );
  }

  // Calcular dimensiones del gráfico
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Encontrar valores máximos para escalar el gráfico
  const maxPoints = Math.max(...data.map((d) => Math.max(d.remaining, d.ideal, d.completed)));

  // Calcular escalas
  const xScale = chartWidth / (data.length - 1);
  const yScale = chartHeight / maxPoints;

  // Generar puntos para las líneas
  const remainingPoints = data.map((d, i) => ({
    x: padding + i * xScale,
    y: height - padding - d.remaining * yScale,
  }));

  const idealPoints = data.map((d, i) => ({
    x: padding + i * xScale,
    y: height - padding - d.ideal * yScale,
  }));

  const completedPoints = data.map((d, i) => ({
    x: padding + i * xScale,
    y: height - padding - d.completed * yScale,
  }));

  // Generar paths para las líneas
  const remainingPath = `M ${remainingPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const idealPath = `M ${idealPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;
  const completedPath = `M ${completedPoints.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Gráfico de Burndown</h3>

      <svg width={width} height={height}>
        {/* Eje X */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#CBD5E0"
          stroke-width="1"
        />

        {/* Eje Y */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#CBD5E0"
          stroke-width="1"
        />

        {/* Líneas de cuadrícula horizontales */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + (chartHeight / 4) * i;
          return (
            <line
              key={`grid-h-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#EDF2F7"
              stroke-width="1"
            />
          );
        })}

        {/* Líneas de cuadrícula verticales */}
        {data.map((_d, i) => {
          const x = padding + i * xScale;
          return (
            <line
              key={`grid-v-${i}`}
              x1={x}
              y1={padding}
              x2={x}
              y2={height - padding}
              stroke="#EDF2F7"
              stroke-width="1"
            />
          );
        })}

        {/* Etiquetas del eje X (fechas) */}
        {data.map((d, i) => {
          // Mostrar solo algunas fechas para evitar solapamiento
          if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
            const x = padding + i * xScale;
            return (
              <text
                key={`x-label-${i}`}
                x={x}
                y={height - padding + 15}
                text-anchor="middle"
                font-size="10"
                fill="#4A5568"
              >
                {d.date.split("-").slice(1).join("/")}
              </text>
            );
          }
          return null;
        })}

        {/* Etiquetas del eje Y (puntos) */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = height - padding - (chartHeight / 4) * i;
          const value = Math.round((maxPoints / 4) * i);
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 3}
              text-anchor="end"
              font-size="10"
              fill="#4A5568"
            >
              {value}
            </text>
          );
        })}

        {/* Línea ideal */}
        <path d={idealPath} fill="none" stroke="#CBD5E0" stroke-width="2" stroke-dasharray="5,5" />

        {/* Línea de puntos completados */}
        <path d={completedPath} fill="none" stroke="#48BB78" stroke-width="2" />

        {/* Línea de puntos restantes */}
        <path d={remainingPath} fill="none" stroke="#3182CE" stroke-width="2" />

        {/* Puntos de datos para puntos restantes */}
        {remainingPoints.map((p, i) => (
          <circle key={`remaining-${i}`} cx={p.x} cy={p.y} r="4" fill="#3182CE" />
        ))}

        {/* Leyenda */}
        <rect x={width - 150} y={padding} width="130" height="60" fill="white" stroke="#E2E8F0" />
        <circle cx={width - 130} cy={padding + 15} r="4" fill="#3182CE" />
        <text x={width - 120} y={padding + 18} font-size="10" fill="#4A5568">
          Puntos Restantes
        </text>
        <line
          x1={width - 140}
          y1={padding + 30}
          x2={width - 120}
          y2={padding + 30}
          stroke="#CBD5E0"
          stroke-width="2"
          stroke-dasharray="5,5"
        />
        <text x={width - 115} y={padding + 33} font-size="10" fill="#4A5568">
          Ideal
        </text>
        <circle cx={width - 130} cy={padding + 45} r="4" fill="#48BB78" />
        <text x={width - 120} y={padding + 48} font-size="10" fill="#4A5568">
          Puntos Completados
        </text>
      </svg>

      {/* Botones de actualización y recálculo */}
      <div class="mt-2 flex justify-between items-center">
        <div class="text-xs text-gray-500">
          {data && data.length > 0 && (
            <span>Última actualización: {new Date().toLocaleTimeString()}</span>
          )}
        </div>
        <div class="space-x-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading || recalculating}
            class="text-sm text-blue-500 hover:text-blue-700 disabled:text-gray-400"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
          <button
            type="button"
            onClick={recalculateBurndown}
            disabled={loading || recalculating}
            class="text-sm text-orange-500 hover:text-orange-700 disabled:text-gray-400 border border-orange-300 px-2 py-1 rounded"
          >
            {recalculating ? "Recalculando..." : "Recalcular"}
          </button>
        </div>
      </div>
    </div>
  );
}
