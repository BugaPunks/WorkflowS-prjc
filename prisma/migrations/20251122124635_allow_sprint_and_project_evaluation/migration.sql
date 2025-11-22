-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_evaluations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "sprintId" TEXT,
    "evaluatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "feedback" TEXT,
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "evaluations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluations_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluations_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "sprints" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluations_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_evaluations" ("createdAt", "evaluatorId", "feedback", "id", "projectId", "score", "status", "taskId", "updatedAt") SELECT "createdAt", "evaluatorId", "feedback", "id", "projectId", "score", "status", "taskId", "updatedAt" FROM "evaluations";
DROP TABLE "evaluations";
ALTER TABLE "new_evaluations" RENAME TO "evaluations";
CREATE INDEX "evaluations_projectId_idx" ON "evaluations"("projectId");
CREATE INDEX "evaluations_taskId_idx" ON "evaluations"("taskId");
CREATE INDEX "evaluations_sprintId_idx" ON "evaluations"("sprintId");
CREATE INDEX "evaluations_evaluatorId_idx" ON "evaluations"("evaluatorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
