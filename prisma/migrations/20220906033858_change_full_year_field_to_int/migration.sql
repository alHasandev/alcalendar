/*
  Warnings:

  - You are about to alter the column `fullYear` on the `Year` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Year" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullYear" INTEGER NOT NULL
);
INSERT INTO "new_Year" ("fullYear", "id") SELECT "fullYear", "id" FROM "Year";
DROP TABLE "Year";
ALTER TABLE "new_Year" RENAME TO "Year";
CREATE UNIQUE INDEX "Year_fullYear_key" ON "Year"("fullYear");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
