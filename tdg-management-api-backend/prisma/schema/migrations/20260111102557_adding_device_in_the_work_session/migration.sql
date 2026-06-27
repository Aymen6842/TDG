-- CreateEnum
CREATE TYPE "WorkSessionDevice" AS ENUM ('DESKTOP', 'MOBILE');

-- AlterTable
ALTER TABLE "WorkSession" ADD COLUMN     "device" "WorkSessionDevice";
