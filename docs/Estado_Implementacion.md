# Estado de Implementación del Proyecto "WorkflowS"

Este documento resume el estado actual del desarrollo en comparación con los requisitos definidos en `Instrucciones.md`.

## ✅ Módulos Implementados

La mayoría de los requisitos funcionales (RF) y no funcionales han sido completados satisfactoriamente.

### Módulo 1: Gestión de Usuarios y Roles
- **RF1.1 (CRUD Usuarios):** Implementado. Registro y gestión de usuarios.
- **RF1.2 (Roles):** Soporte completo para Admin, Scrum Master, Product Owner y Team Developer.
- **RF1.3 (Asignación):** Los usuarios pueden ser asignados a proyectos con roles específicos.

### Módulo 2: Gestión de Proyectos
- **RF2.1 (CRUD Proyectos):** Implementado. Creación, edición y visualización.
- **RF2.2 (Asignación Estudiantes):** Funcionalidad de miembros del equipo operativa.
- **RF2.3 (Fechas):** Fechas de inicio y fin definibles por proyecto.

### Módulo 3: Gestión de Sprints
- **RF3.1 (CRUD Sprints):** Creación y gestión de sprints dentro del detalle del proyecto.
- **RF3.2 (Asignación Historias):** Las historias se pueden mover del Backlog a Sprints específicos.
- **RF3.3 (Fechas):** Gestión de plazos de sprints implementada.

### Módulo 4: Gestión del Backlog
- **RF4.1 (CRUD Historias):** Implementado.
- **RF4.2 (Prioridades):** Soporte para prioridades (Baja, Media, Alta, Crítica).
- **RF4.3 (Criterios de Aceptación):** Campo específico implementado y verificado en tests.
- **RF5.1 - RF5.3 (Gestión de Tareas):** Creación de tareas asociadas a historias/sprints, asignación y cambio de estado.

### Módulo 5: Tablero Kanban
- **RF6.1 (Tablero Visual):** Implementado en la vista de detalles del Sprint.
- **RF6.2 (Drag-and-Drop):** Funcionalidad completa para mover tareas entre estados (To Do, In Progress, Done).

### Módulo 6: Evaluación y Retroalimentación
- **RF7.1 (Evaluación con Criterios):** Sistema de Rúbricas implementado. Los docentes pueden crear rúbricas con criterios y pesos personalizados.
- **RF7.2 (Calificaciones):** Cálculo automático de notas basado en la rúbrica.
- **RF7.3 (Retroalimentación):** Campo de feedback cualitativo disponible en la evaluación.

### Módulo 7: Métricas y Reportes
- **RF8.1 (Burndown Chart):** Gráfico funcional que muestra el progreso ideal vs. real del sprint.
- **RF8.2 (Contribución Individual):** Métricas de tareas completadas por usuario.
- **RF8.3 (Reportes):** Vista consolidada de reportes accesible para roles administrativos.

### Módulo 8: Comunicación y Documentos
- **RF9.1 (Mensajería):** Chat de equipo implementado (actualización mediante polling).
- **RF9.2 (Notificaciones):** Sistema de notificaciones para asignación de tareas y evaluaciones.
- **RF10.1 (Documentos):** Carga y descarga de archivos implementada.
- **RF10.2 (Versionado):** El sistema detecta nombres duplicados y crea nuevas versiones automáticamente.

### Módulo 9: Utilidades
- **Calendario de Eventos (Iteración 4):** Implementado. Vista de calendario mensual que visualiza:
    - Duración de Sprints (inicio a fin).
    - Fechas de entrega (Deadlines) de tareas.

### Extras Implementados
- **Exportación de Datos:** Funcionalidad para exportar reportes y datos de proyectos (Iteración 5 parcial).
- **Tests E2E:** Cobertura robusta con Playwright para los flujos principales.

---

## ⚠️ Implementación Parcial o Pendiente

Los siguientes elementos, mencionados en las instrucciones o como ideas adicionales, no están presentes o están parcialmente desarrollados:

### 1. Interoperabilidad (Importación)
- **Estado:** Parcial.
- **Detalle:** Se implementó la **exportación** de datos, pero la **importación** masiva (ej. cargar usuarios desde CSV) no está disponible.

### 2. Ideas Adicionales (Opcionales)
- **Gamificación:** No se implementaron insignias o sistemas de recompensas.
- **Peer Review:** La evaluación es realizada principalmente por el docente/admin, no hay un flujo explícito automatizado para evaluación entre estudiantes.

---

## 🛠 Estado Técnico

- **Build:** El proyecto compila correctamente (`npm run build`).
- **Calidad de Código:** Validado con Biome (`npm run check`).
- **Testing:** Tests de integración (E2E) cubren los módulos críticos (Auth, Proyectos, Sprints, Kanban, Documentos, Rúbricas, Métricas, Calendario).
