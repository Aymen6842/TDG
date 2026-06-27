/*
  Warnings:

  - You are about to drop the column `token` on the `UserTelegramBot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserNotificationSettings" ADD COLUMN     "ntfyNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserTelegramBot" DROP COLUMN "token";

-- CreateTable
CREATE TABLE "UserNtfyIntegration" (
    "id" TEXT NOT NULL,
    "token" TEXT,
    "topic" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNtfyIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNtfyIntegration_userId_key" ON "UserNtfyIntegration"("userId");

-- AddForeignKey
ALTER TABLE "UserNtfyIntegration" ADD CONSTRAINT "UserNtfyIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
