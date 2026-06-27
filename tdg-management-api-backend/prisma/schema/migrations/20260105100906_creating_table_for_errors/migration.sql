-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('CronJob', 'Api');

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "type" "ErrorType" NOT NULL,
    "endpoint" TEXT,
    "message" TEXT,
    "stackTrace" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ErrorLog_hash_key" ON "ErrorLog"("hash");
