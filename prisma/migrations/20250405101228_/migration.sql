/*
  Warnings:

  - You are about to drop the column `adminId` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appeal" DROP CONSTRAINT "Appeal_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Appeal" DROP CONSTRAINT "Appeal_userId_fkey";

-- AlterTable
ALTER TABLE "Appeal" DROP COLUMN "adminId",
DROP COLUMN "userId";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "UserRole";
