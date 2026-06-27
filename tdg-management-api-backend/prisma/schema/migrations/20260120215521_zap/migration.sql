/*
  Warnings:

  - You are about to drop the column `lastHealthCheckAt` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `lastHealthCheckAt` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "lastHealthCheckAt";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "lastHealthCheckAt";
