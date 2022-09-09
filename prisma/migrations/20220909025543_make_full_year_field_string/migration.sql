-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Year" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullYear" TEXT NOT NULL,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_Year" ("fullYear", "id", "updated") SELECT "fullYear", "id", "updated" FROM "Year";
DROP TABLE "Year";
ALTER TABLE "new_Year" RENAME TO "Year";
CREATE UNIQUE INDEX "Year_fullYear_key" ON "Year"("fullYear");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
