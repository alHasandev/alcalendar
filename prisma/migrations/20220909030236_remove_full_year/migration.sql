/*
  Warnings:

  - You are about to drop the column `fullYear` on the `Year` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Year" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "updated" DATETIME NOT NULL
);
INSERT INTO "new_Year" ("id", "updated") SELECT "id", "updated" FROM "Year";
DROP TABLE "Year";
ALTER TABLE "new_Year" RENAME TO "Year";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
