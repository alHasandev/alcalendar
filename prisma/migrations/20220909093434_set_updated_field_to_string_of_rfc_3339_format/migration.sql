-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Month" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "daysCount" INTEGER NOT NULL,
    "weeksCount" INTEGER NOT NULL,
    "updated" TEXT NOT NULL,
    "yearId" INTEGER NOT NULL,
    CONSTRAINT "Month_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "Year" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Month" ("daysCount", "id", "index", "name", "updated", "weeksCount", "yearId") SELECT "daysCount", "id", "index", "name", "updated", "weeksCount", "yearId" FROM "Month";
DROP TABLE "Month";
ALTER TABLE "new_Month" RENAME TO "Month";
CREATE TABLE "new_Year" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updated" TEXT NOT NULL
);
INSERT INTO "new_Year" ("id", "updated") SELECT "id", "updated" FROM "Year";
DROP TABLE "Year";
ALTER TABLE "new_Year" RENAME TO "Year";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
