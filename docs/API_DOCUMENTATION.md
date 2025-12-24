# Documentación de la API (Node.js + Express)

Esta documentación detalla los endpoints disponibles en la API RESTful desarrollada con Node.js y Express. La API sirve como backend para la plataforma de gestión de proyectos Scrum.

**URL Base:** `/api`
**Puerto por defecto:** `5000`

---

## ⚙️ Sistema

### Health Check
- **Ruta:** `GET /api/health`
- **Descripción:** Verifica que el servidor esté activo.
- **Respuestas:**
  - `200 OK`: JSON con estado y timestamp.

---

## 🔐 Autenticación (`/api/auth`)

Endpoints para gestión de sesiones y registro de usuarios. Utiliza JWT para autenticación.

### Registrar Usuario
- **Ruta:** `POST /register`
- **Descripción:** Crea un nuevo usuario en la plataforma.
- **Body:**
  - `name`: string (requerido)
  - `email`: string (requerido, formato email válido)
  - `password`: string (requerido, mín. 6 caracteres)
  - `role`: string (opcional, default: "TEAM_DEVELOPER")
- **Respuestas:**
  - `201 Created`: Usuario registrado exitosamente.
  - `400 Bad Request`: Faltan campos, email inválido, contraseña corta o email ya registrado.
  - `500 Internal Server Error`: Error del servidor.

### Iniciar Sesión
- **Ruta:** `POST /login`
- **Descripción:** Autentica un usuario y devuelve un token JWT.
- **Body:**
  - `email`: string (requerido)
  - `password`: string (requerido)
- **Respuestas:**
  - `200 OK`: Inicio de sesión exitoso (incluye token y datos del usuario).
  - `400 Bad Request`: Faltan credenciales.
  - `401 Unauthorized`: Credenciales incorrectas.
  - `403 Forbidden`: Usuario desactivado.
  - `500 Internal Server Error`: Error del servidor.

### Cerrar Sesión
- **Ruta:** `POST /logout`
- **Descripción:** Invalida la sesión (actualmente gestionado principalmente en frontend borrando el token).
- **Respuestas:**
  - `200 OK`: Mensaje de confirmación.

---

## 👥 Usuarios (`/api/users`)

Endpoints para la gestión de usuarios.

### Obtener Todos los Usuarios
- **Ruta:** `GET /`
- **Descripción:** Obtiene la lista de todos los usuarios registrados.
- **Respuestas:**
  - `200 OK`: Lista de usuarios (id, email, nombre, rol, activo, fecha creación).
  - `500 Internal Server Error`: Error del servidor.

### Obtener Usuario por ID
- **Ruta:** `GET /:id`
- **Descripción:** Obtiene los detalles de un usuario específico, incluyendo proyectos y tareas.
- **Parámetros:** `id` (UUID del usuario)
- **Respuestas:**
  - `200 OK`: Datos del usuario.
  - `404 Not Found`: Usuario no encontrado.
  - `500 Internal Server Error`: Error del servidor.

### Crear Usuario (Admin)
- **Ruta:** `POST /`
- **Descripción:** Permite crear usuarios manualmente (útil para administradores).
- **Body:** `email`, `name`, `password`, `role` (opcional).
- **Respuestas:**
  - `201 Created`: Usuario creado.
  - `400 Bad Request`: Faltan campos o email duplicado.
  - `500 Internal Server Error`: Error del servidor.

### Actualizar Usuario
- **Ruta:** `PUT /:id`
- **Descripción:** Actualiza información de un usuario.
- **Parámetros:** `id` (UUID del usuario)
- **Body:** `name`, `email`, `role`, `active`, `password` (opcional).
- **Respuestas:**
  - `200 OK`: Usuario actualizado.
  - `500 Internal Server Error`: Error del servidor.

### Eliminar Usuario
- **Ruta:** `DELETE /:id`
- **Descripción:** Elimina un usuario del sistema.
- **Parámetros:** `id` (UUID del usuario)
- **Respuestas:**
  - `200 OK`: Mensaje de confirmación.
  - `500 Internal Server Error`: Error del servidor.

---

## 🚀 Proyectos (`/api/projects`)

Gestión de proyectos y sus miembros.

### Obtener Proyectos
- **Ruta:** `GET /`
- **Query Params:** `memberId` (opcional) - Filtra proyectos donde el usuario es miembro o dueño.
- **Descripción:** Obtiene la lista de proyectos.
- **Respuestas:**
  - `200 OK`: Lista de proyectos (incluye dueño, miembros y sprints).
  - `500 Internal Server Error`: Error del servidor.

### Obtener Proyecto por ID
- **Ruta:** `GET /:id`
- **Descripción:** Obtiene detalles completos de un proyecto.
- **Parámetros:** `id` (UUID del proyecto)
- **Respuestas:**
  - `200 OK`: Datos del proyecto (incluye miembros, sprints, historias de usuario, tareas).
  - `404 Not Found`: Proyecto no encontrado.
  - `500 Internal Server Error`: Error del servidor.

### Crear Proyecto
- **Ruta:** `POST /`
- **Descripción:** Crea un nuevo proyecto.
- **Body:** `name`, `description`, `ownerId`, `startDate`, `endDate`.
- **Respuestas:**
  - `201 Created`: Proyecto creado.
  - `400 Bad Request`: Faltan campos.
  - `500 Internal Server Error`: Error del servidor.

### Actualizar Proyecto
- **Ruta:** `PUT /:id`
- **Descripción:** Actualiza datos de un proyecto.
- **Parámetros:** `id` (UUID del proyecto)
- **Body:** Campos a actualizar (`startDate`, `endDate`, etc.).
- **Respuestas:**
  - `200 OK`: Proyecto actualizado.
  - `500 Internal Server Error`: Error del servidor.

### Asignar Miembro
- **Ruta:** `POST /:id/members`
- **Descripción:** Agrega un usuario como miembro del proyecto o actualiza su rol. Genera notificación.
- **Parámetros:** `id` (UUID del proyecto)
- **Body:** `userId`, `role` (SCRUM_MASTER, PRODUCT_OWNER, TEAM_DEVELOPER).
- **Respuestas:**
  - `201 Created` / `200 OK`: Miembro asignado/actualizado.
  - `400 Bad Request`: Faltan datos.
  - `500 Internal Server Error`: Error del servidor.

### Eliminar Miembro
- **Ruta:** `DELETE /:id/members/:userId`
- **Descripción:** Elimina a un miembro del proyecto.
- **Parámetros:** `id` (Project ID), `userId` (User ID).
- **Respuestas:**
  - `200 OK`: Miembro eliminado.
  - `500 Internal Server Error`: Error del servidor.

### Eliminar Proyecto
- **Ruta:** `DELETE /:id`
- **Descripción:** Elimina un proyecto completamente.
- **Parámetros:** `id` (UUID del proyecto)
- **Respuestas:**
  - `200 OK`: Proyecto eliminado.
  - `500 Internal Server Error`: Error del servidor.

---

## 🏃 Sprints (`/api/sprints`)

Gestión de ciclos de trabajo (Sprints).

### Obtener Sprints
- **Ruta:** `GET /`
- **Descripción:** Obtiene todos los sprints.
- **Respuestas:** `200 OK` con lista de sprints.

### Obtener Sprint por ID
- **Ruta:** `GET /:id`
- **Descripción:** Detalle de un sprint específico.
- **Parámetros:** `id` (UUID del sprint)
- **Respuestas:**
  - `200 OK`: Datos del sprint.
  - `404 Not Found`: No encontrado.

### Crear Sprint
- **Ruta:** `POST /`
- **Descripción:** Crea un nuevo sprint en un proyecto.
- **Body:** `name`, `description`, `projectId`, `startDate`, `endDate`, `status`.
- **Respuestas:** `201 Created` con el sprint creado.

### Actualizar Sprint
- **Ruta:** `PUT /:id`
- **Descripción:** Actualiza un sprint.
- **Parámetros:** `id` (UUID del sprint)
- **Body:** Campos a actualizar.
- **Respuestas:** `200 OK` con sprint actualizado.

### Agregar Historia a Sprint
- **Ruta:** `POST /:id/add-story`
- **Descripción:** Mueve una historia de usuario al sprint especificado.
- **Parámetros:** `id` (UUID del sprint)
- **Body:** `userStoryId`.
- **Respuestas:** `201 Created` con la historia actualizada.

### Eliminar Sprint
- **Ruta:** `DELETE /:id`
- **Descripción:** Elimina un sprint.
- **Respuestas:** `200 OK`.

---

## ✅ Tareas (`/api/tasks`)

Gestión de tareas individuales.

### Obtener Tareas
- **Ruta:** `GET /`
- **Query Params:** `assigneeId`, `projectId`.
- **Descripción:** Filtra tareas por asignado o proyecto.
- **Respuestas:** `200 OK` con lista de tareas.

### Obtener Tarea por ID
- **Ruta:** `GET /:id`
- **Respuestas:** `200 OK` o `404 Not Found`.

### Crear Tarea
- **Ruta:** `POST /`
- **Descripción:** Crea una nueva tarea. Genera notificación si se asigna.
- **Body:** `title`, `description`, `projectId`, `assigneeId`, `priority`, `deadline`, `status`, `sprintId`, `userStoryId`.
- **Respuestas:** `201 Created`.

### Actualizar Tarea
- **Ruta:** `PUT /:id`
- **Descripción:** Actualiza estado, asignación, fechas, etc. Maneja lógica de `completedAt`.
- **Body:** Campos a actualizar.
- **Respuestas:** `200 OK`.

### Eliminar Tarea
- **Ruta:** `DELETE /:id`
- **Respuestas:** `200 OK`.

### Evaluar Tarea
- **Ruta:** `POST /:id/evaluate`
- **Descripción:** Guarda una evaluación para una tarea completada. Notifica al asignado.
- **Body:** `score`, `feedback`, `evaluatorId`, `criteriaScores` (array).
- **Respuestas:** `201 Created`.

---

## 📖 Historias de Usuario (`/api/user-stories`)

Gestión de requisitos del producto.

### Endpoints Estándar
- `GET /`: Obtener todas.
- `GET /:id`: Obtener por ID.
- `POST /`: Crear (`title`, `description`, `acceptance`, `projectId`, `assigneeId`, `priority`, `storyPoints`).
- `PUT /:id`: Actualizar. Notifica si cambia el asignado.
- `DELETE /:id`: Eliminar.

---

## 💬 Chat (`/api/chat`)

Sistema de mensajería (Proyectos y Mensajes Directos).

### Mensajes de Proyecto
- `GET /:projectId/messages`: Obtiene el historial de chat de un proyecto.
- `POST /:projectId/messages`: Envía un mensaje al chat de proyecto.

### Mensajes Directos (DM)
- `GET /user/:userId/all`: Obtiene todos los chats directos del usuario.
- `POST /direct`: Crea o recupera un chat privado entre dos usuarios.
- `GET /conversation/:chatId/messages`: Obtiene mensajes de una conversación específica.
- `POST /conversation/:chatId/messages`: Envía mensaje a una conversación específica. Notifica al receptor.

---

## 📂 Documentos (`/api/documents`)

Gestión de archivos adjuntos y control de versiones.

### Listar Documentos
- **Ruta:** `GET /:projectId`
- **Descripción:** Obtiene documentos raíz y sus últimas versiones.

### Subir Documento (Raíz)
- **Ruta:** `POST /:projectId`
- **Body:** `file` (multipart/form-data).
- **Descripción:** Sube un nuevo documento. Si ya existe uno con el mismo nombre, crea una nueva versión.

### Subir Nueva Versión
- **Ruta:** `POST /:id/versions`
- **Parámetros:** `id` (ID del documento padre).
- **Body:** `file` (multipart/form-data).
- **Descripción:** Sube explícitamente una nueva versión de un documento.

### Historial de Versiones
- **Ruta:** `GET /:id/versions`
- **Descripción:** Obtiene todas las versiones de un documento.

### Eliminar Documento
- **Ruta:** `DELETE /:id`

---

## 📝 Evaluaciones (`/api/evaluations`)

Sistema de calificación para tareas, sprints y proyectos.

### Obtener Evaluaciones
- `GET /:id`: Por ID de evaluación.
- `GET /task/:taskId`: Todas las evaluaciones de una tarea.
- `GET /sprint/:sprintId`: Todas las evaluaciones de un sprint.
- `GET /project/:projectId/general`: Evaluaciones generales del proyecto.
- `GET /student/:studentId`: Todas las calificaciones de un estudiante (tareas propias + equipo).

### Gestionar Evaluaciones
- `POST /`: Crear evaluación (admite contexto de Task, Sprint o Project).
- `PUT /:id`: Modificar evaluación existente (feedback, nota, criterios).

---

## 📊 Rúbricas (`/api/rubrics`)

Plantillas de criterios de evaluación.

- `GET /?projectId=...`: Obtiene rúbricas (globales + específicas del proyecto).
- `POST /`: Crear rúbrica con criterios (`name`, `maxScore`, `weight`).
- `PUT /:id`: Actualizar rúbrica y sus criterios.
- `DELETE /:id`: Eliminar rúbrica.

---

## 📈 Métricas (`/api/metrics`)

Reportes y análisis de datos.

### Burndown Chart
- **Ruta:** `GET /sprints/:sprintId/burndown`
- **Descripción:** Calcula puntos ideales vs reales restantes día a día en un sprint.

### Contribución Individual
- **Ruta:** `GET /projects/:projectId/contribution`
- **Descripción:** Ranking de tareas completadas por usuario en un proyecto.

### Velocidad de Equipo
- **Ruta:** `GET /projects/:projectId/velocity`
- **Descripción:** Comparativa de puntos comprometidos vs completados por sprint.

### Exportar Datos
- **Ruta:** `GET /export/projects/:projectId`
- **Descripción:** Genera y descarga un archivo CSV con el reporte del proyecto.

---

## 🔔 Notificaciones (`/api/notifications`)

- `GET /?userId=...`: Obtiene las últimas 20 notificaciones del usuario.
- `PUT /:id/read`: Marca una notificación como leída.

---

## 🔄 Retrospectivas (`/api/retrospectives`)

Gestión del tablero de retrospectiva ("Went Well", "To Improve", "Action Items").

- `GET /:sprintId`: Obtiene items del tablero.
- `POST /`: Crea un nuevo item/nota. Notifica al equipo.
- `DELETE /:id`: Elimina un item.
