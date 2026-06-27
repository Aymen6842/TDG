/*
  Warnings:

  - You are about to drop the column `notificationTokenId` on the `UserNotification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notificationId,userId]` on the table `UserNotification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserNotification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserNotification" DROP CONSTRAINT "UserNotification_notificationTokenId_fkey";

-- AlterTable
ALTER TABLE "UserNotification" DROP COLUMN "notificationTokenId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "notificationId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_notificationId_userId_key" ON "UserNotification"("notificationId", "userId");

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
