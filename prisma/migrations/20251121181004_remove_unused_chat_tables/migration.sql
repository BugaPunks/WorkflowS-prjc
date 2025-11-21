/*
  Warnings:

  - You are about to drop the `conversation_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `conversationId` on the `messages` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "conversation_participants_conversationId_userId_key";

-- DropIndex
DROP INDEX "conversations_chatId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "conversation_participants";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "conversations";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_messages" ("content", "createdAt", "id", "updatedAt", "userId") SELECT "content", "createdAt", "id", "updatedAt", "userId" FROM "messages";
DROP TABLE "messages";
ALTER TABLE "new_messages" RENAME TO "messages";
CREATE INDEX "messages_chatId_idx" ON "messages"("chatId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
