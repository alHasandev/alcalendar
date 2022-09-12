/*
  Warnings:

  - The primary key for the `Mark` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "markId" TEXT NOT NULL,
    CONSTRAINT "Config_markId_fkey" FOREIGN KEY ("markId") REFERENCES "Mark" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Config" ("id", "markId") SELECT "id", "markId" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
CREATE UNIQUE INDEX "Config_markId_key" ON "Config"("markId");
CREATE TABLE "new_Mark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "startAt" INTEGER,
    "endAt" INTEGER,
    "dateId" TEXT NOT NULL,
    "authorId" TEXT,
    "groupId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mark_dateId_fkey" FOREIGN KEY ("dateId") REFERENCES "Date" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mark_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mark_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Mark" ("authorId", "dateId", "description", "endAt", "groupId", "id", "image", "startAt", "summary", "type", "updatedAt") SELECT "authorId", "dateId", "description", "endAt", "groupId", "id", "image", "startAt", "summary", "type", "updatedAt" FROM "Mark";
DROP TABLE "Mark";
ALTER TABLE "new_Mark" RENAME TO "Mark";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
