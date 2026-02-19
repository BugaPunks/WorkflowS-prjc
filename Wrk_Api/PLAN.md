# Wrk_Api Reconstruction Plan

This document outlines the step-by-step plan to recreate the existing Node.js/Prisma API in Go using Gin and GORM.

## Phase 1: Foundation (Completed)
1.  **Project Initialization**: Set up Go project, `go.mod`, and dependencies (`gin`, `gorm`, `sqlite`, `uuid`).
2.  **Database Models**: Create GORM structs mirroring the Prisma schema in `internal/models`.
    *   Covered: User, Project, Document, ProjectMember, Sprint, UserStory, Task, Rubric, Criteria, Evaluation, Chat, Notification, etc.
3.  **Database Connection**: Implement database connection and auto-migration in `internal/database`.
4.  **Basic Server**: Entry point in `cmd/api/main.go`.
5.  **User API (Basic)**: Implemented Create and Get Users.

## Phase 2: Core Resources Implementation
For each resource, implement:
*   **Handlers**: `internal/handlers/<resource>.go` (CRUD operations).
*   **Routes**: Register routes in `internal/routes/routes.go`.
*   **Validation**: Add input validation using struct tags or custom logic.

### Steps:
1.  **Authentication & Authorization**:
    *   Implement JWT Middleware.
    *   Add Login/Register endpoints in `handlers/auth.go`.
    *   Protect routes with middleware.

2.  **Projects API**:
    *   CRUD for Projects.
    *   Project Members management (Add/Remove/Update Role).
    *   Documents association.

3.  **Sprints & User Stories**:
    *   CRUD for Sprints.
    *   CRUD for User Stories (linked to Projects/Sprints).
    *   Status transitions.

4.  **Tasks API**:
    *   CRUD for Tasks.
    *   Assignment logic.
    *   Filtering by Project/Sprint/UserStory.

5.  **Evaluations & Rubrics**:
    *   CRUD for Rubrics and Criteria.
    *   Evaluation submission logic (calculating scores).

6.  **Communication (Chat & Notifications)**:
    *   Chat API (Rooms/Direct Messages).
    *   WebSocket integration for real-time messages (optional but recommended).
    *   Notification system.

## Phase 3: Refinement & Production Readiness
1.  **Configuration**: Move configuration to `.env` (already started).
2.  **Error Handling**: Standardize error responses.
3.  **Logging**: Implement structured logging.
4.  **Testing**: Add unit and integration tests.
5.  **Dockerization**: Create `Dockerfile` and `docker-compose.yml`.

## Phase 4: Migration
1.  **Data Migration**: Script to migrate data from the old database (if needed).
2.  **Deployment**: Setup CI/CD and deployment pipeline.
