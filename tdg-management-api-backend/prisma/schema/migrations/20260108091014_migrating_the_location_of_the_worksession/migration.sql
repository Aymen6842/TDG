/*
  Warnings:

  - Added the required column `location` to the `WorkSession` table without a default value. This is not possible if the table is not empty.
  - Made the column `timeSpentInMinutes` on table `WorkSession` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WorkSessionLocation" AS ENUM ('REMOTE', 'ONSITE');

-- AlterTable
ALTER TABLE "WorkSession" ADD COLUMN     "location" "WorkSessionLocation" NOT NULL,
ALTER COLUMN "timeSpentInMinutes" SET NOT NULL,
ALTER COLUMN "timeSpentInMinutes" SET DEFAULT 0;
