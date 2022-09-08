/*
  Warnings:

  - Added the required column `daysCount` to the `Month` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weeksCount` to the `Month` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekIndex` to the `Date` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Month" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "weeksCount" INTEGER NOT NULL,
    "yearId" INTEGER NOT NULL,
    CONSTRAINT "Month_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Month" ("id", "index", "name", "yearId") SELECT "id", "index", "name", "yearId" FROM "Month";
DROP TABLE "Month";
ALTER TABLE "new_Month" RENAME TO "Month";
CREATE TABLE "new_Date" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rawDate" DATETIME NOT NULL,
    "date" INTEGER NOT NULL,
    "dayName" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "monthId" INTEGER NOT NULL,
    CONSTRAINT "Date_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Date" ("date", "dayIndex", "dayName", "id", "monthId", "rawDate") SELECT "date", "dayIndex", "dayName", "id", "monthId", "rawDate" FROM "Date";
DROP TABLE "Date";
ALTER TABLE "new_Date" RENAME TO "Date";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
