-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_documents" ("id", "name", "projectId", "size", "type", "uploadedAt", "url") SELECT "id", "name", "projectId", "size", "type", "uploadedAt", "url" FROM "documents";
DROP TABLE "documents";
ALTER TABLE "new_documents" RENAME TO "documents";
CREATE INDEX "documents_projectId_idx" ON "documents"("projectId");
CREATE INDEX "documents_parentId_idx" ON "documents"("parentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
