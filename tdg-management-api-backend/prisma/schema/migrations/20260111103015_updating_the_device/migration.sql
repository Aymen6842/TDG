/*
  Warnings:

  - Made the column `device` on table `WorkSession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkSessionDevice" ADD VALUE 'TABLET';
ALTER TYPE "WorkSessionDevice" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "WorkSession" ALTER COLUMN "device" SET NOT NULL;
