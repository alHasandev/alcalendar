/*
  Warnings:

  - You are about to drop the column `shortYear` on the `Year` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Year" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullYear" TEXT NOT NULL
);
INSERT INTO "new_Year" ("fullYear", "id") SELECT "fullYear", "id" FROM "Year";
DROP TABLE "Year";
ALTER TABLE "new_Year" RENAME TO "Year";
CREATE UNIQUE INDEX "Year_fullYear_key" ON "Year"("fullYear");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
