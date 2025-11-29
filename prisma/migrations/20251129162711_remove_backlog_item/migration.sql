/*
  Warnings:

  - You are about to drop the `backlog_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `backlogItemId` on the `tasks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "backlog_items_assigneeId_idx";

-- DropIndex
DROP INDEX "backlog_items_userStoryId_idx";

-- DropIndex
DROP INDEX "backlog_items_sprintId_idx";

-- DropIndex
DROP INDEX "backlog_items_projectId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "backlog_items";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userStoryId" TEXT,
    "sprintId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "deadline" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assigneeId" TEXT,
    CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_userStoryId_fkey" FOREIGN KEY ("userStoryId") REFERENCES "user_stories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tasks_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("assigneeId", "completedAt", "createdAt", "deadline", "description", "id", "priority", "projectId", "sprintId", "status", "title", "updatedAt", "userStoryId") SELECT "assigneeId", "completedAt", "createdAt", "deadline", "description", "id", "priority", "projectId", "sprintId", "status", "title", "updatedAt", "userStoryId" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
