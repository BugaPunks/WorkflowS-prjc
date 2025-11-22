-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rubrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "rubrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_rubrics" ("createdAt", "description", "id", "name", "projectId", "updatedAt") SELECT "createdAt", "description", "id", "name", "projectId", "updatedAt" FROM "rubrics";
DROP TABLE "rubrics";
ALTER TABLE "new_rubrics" RENAME TO "rubrics";
CREATE INDEX "rubrics_projectId_idx" ON "rubrics"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
