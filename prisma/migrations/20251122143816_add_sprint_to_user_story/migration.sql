-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "acceptance" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "storyPoints" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'BACKLOG',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId_userId" TEXT,
    "assigneeId" TEXT,
    "sprintId" TEXT,
    CONSTRAINT "user_stories_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "user_stories_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "user_stories_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_stories" ("acceptance", "assigneeId", "createdAt", "description", "id", "priority", "projectId", "projectId_userId", "status", "storyPoints", "title", "updatedAt") SELECT "acceptance", "assigneeId", "createdAt", "description", "id", "priority", "projectId", "projectId_userId", "status", "storyPoints", "title", "updatedAt" FROM "user_stories";
DROP TABLE "user_stories";
ALTER TABLE "new_user_stories" RENAME TO "user_stories";
CREATE INDEX "user_stories_projectId_idx" ON "user_stories"("projectId");
CREATE INDEX "user_stories_assigneeId_idx" ON "user_stories"("assigneeId");
CREATE INDEX "user_stories_sprintId_idx" ON "user_stories"("sprintId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
