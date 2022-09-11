/*
  Warnings:

  - You are about to drop the column `lastWeekIndex` on the `Month` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Month" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "weeksCount" INTEGER NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "yearId" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Month_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Month" ("daysCount", "id", "index", "name", "updatedAt", "weekIndex", "weeksCount", "yearId") SELECT "daysCount", "id", "index", "name", "updatedAt", "weekIndex", "weeksCount", "yearId" FROM "Month";
DROP TABLE "Month";
ALTER TABLE "new_Month" RENAME TO "Month";
CREATE UNIQUE INDEX "Month_yearId_weekIndex_key" ON "Month"("yearId", "weekIndex");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
