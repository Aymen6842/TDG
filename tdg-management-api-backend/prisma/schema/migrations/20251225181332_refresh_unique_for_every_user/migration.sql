/*
  Warnings:

  - You are about to drop the column `workdayId` on the `WorkSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,userId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workDayId` to the `WorkSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkSession" DROP CONSTRAINT "WorkSession_workdayId_fkey";

-- AlterTable
ALTER TABLE "WorkSession" DROP COLUMN "workdayId",
ADD COLUMN     "workDayId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserManager_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserManager_userId_managerId_key" ON "UserManager"("userId", "managerId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_type_userId_key" ON "Role"("type", "userId");

-- AddForeignKey
ALTER TABLE "UserManager" ADD CONSTRAINT "UserManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserManager" ADD CONSTRAINT "UserManager_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkSession" ADD CONSTRAINT "WorkSession_workDayId_fkey" FOREIGN KEY ("workDayId") REFERENCES "WorkDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
