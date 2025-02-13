/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Reviews` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Reviews` table. All the data in the column will be lost.
  - You are about to drop the `UniqueReviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Reviews" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "UniqueReviews";
