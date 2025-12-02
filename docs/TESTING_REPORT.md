# Reporte de Pruebas por Iteración

## Iteración 1

| Nombre / requisito | Descripción | Código | Coincide con los esperado |
|--------------------|-------------|--------|---------------------------|
| Gestión de Usuarios y Roles | Crear, editar y eliminar usuarios, incluyendo asignación de roles. | `e2e/user-management.spec.ts` (Líneas 10-100 aprox) | Aprobada |
| Creación y Asignación de Proyectos | Crear proyectos y visualizar sus detalles, incluyendo pestañas de gestión. | `e2e/project-details.spec.ts` (Líneas 68-160 aprox) | Aprobada |
| Gestión de Historias de Usuario (Backlog) | Crear historias de usuario con criterios de aceptación. | `e2e/backlog.spec.ts` (Líneas 54-120 aprox) | Aprobada |

## Iteración 2

| Nombre / requisito | Descripción | Código | Coincide con los esperado |
|--------------------|-------------|--------|---------------------------|
| Planificación de Sprints | Crear sprints y asignar fechas. (Probado como parte del tablero y detalles) | `e2e/sprint-board.spec.ts` (Setup) y `e2e/project-details.spec.ts` | Aprobada |
| Gestión de Tareas (Team Developer) | Crear tareas asignadas a Sprints e Historias de Usuario. | `e2e/task-assignment.spec.ts` (Líneas 55-120 aprox) | Aprobada |
| Tablero Kanban | Visualizar tablero Kanban y mover tareas entre estados. | `e2e/sprint-board.spec.ts` (Líneas 86-150 aprox) | Aprobada |

## Iteración 3

| Nombre / requisito | Descripción | Código | Coincide con los esperado |
|--------------------|-------------|--------|---------------------------|
| Métricas y Reportes de Rendimiento | Visualizar gráficos de Burndown y Contribución. | `e2e/metrics.spec.ts` (Líneas 5-80 aprox) | Aprobada |
| Notificaciones del Sistema | Recibir notificaciones al ser asignado a tareas o proyectos. | `e2e/notifications.spec.ts` (Líneas 5-50) | Aprobada |
| Dashboard Personalizado | Visualización diferenciada según rol (Admin vs Estudiante). | `e2e/dashboards.spec.ts` (Líneas 5-35) | Aprobada |

## Iteración 4

| Nombre / requisito | Descripción | Código | Coincide con los esperado |
|--------------------|-------------|--------|---------------------------|
| Evaluación y Retroalimentación | Gestión de rúbricas, calificación de tareas y visualización de notas. | `e2e/rubrics.spec.ts` y `e2e/grading.spec.ts` | Aprobada |
| Gestión Documental | Subida de archivos, versionamiento e historial. | `e2e/documents.spec.ts` (Líneas 49-140) | Aprobada |
| Sistema de Comunicación Interna | Chat de equipo y widget de mensajes. | `e2e/chat.spec.ts` (Líneas 5-60) | Aprobada |
| Calendario de Eventos | Visualización de calendario con sprints y tareas. | `e2e/calendar.spec.ts` (Líneas 5-40) | Aprobada |

## Iteración 5

| Nombre / requisito | Descripción | Código | Coincide con los esperado |
|--------------------|-------------|--------|---------------------------|
| Exportación de Datos | Funcionalidad de exportación de reportes o datos del sistema. | N/A (No existe prueba automatizada específica) | Pendiente |
