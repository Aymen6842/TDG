-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "lastHealthCheckAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "lastHealthCheckAt" TIMESTAMP(3);
