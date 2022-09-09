/*
  Warnings:

  - You are about to alter the column `updated` on the `Year` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.
  - Added the required column `updated` to the `Month` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Year" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updated" INTEGER NOT NULL
);
INSERT INTO "new_Year" ("id", "updated") SELECT "id", "updated" FROM "Year";
DROP TABLE "Year";
ALTER TABLE "new_Year" RENAME TO "Year";
CREATE TABLE "new_Month" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "weeksCount" INTEGER NOT NULL,
    "updated" INTEGER NOT NULL,
    "yearId" INTEGER NOT NULL,
    CONSTRAINT "Month_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Month" ("daysCount", "id", "index", "name", "weeksCount", "yearId") SELECT "daysCount", "id", "index", "name", "weeksCount", "yearId" FROM "Month";
DROP TABLE "Month";
ALTER TABLE "new_Month" RENAME TO "Month";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
