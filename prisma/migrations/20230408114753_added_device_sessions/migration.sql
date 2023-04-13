/*
  Warnings:

  - You are about to drop the column `userId` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deviceSessionsId]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceSessionsId` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropIndex
DROP INDEX "Token_userId_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "userId",
ADD COLUMN     "deviceSessionsId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DeviceSessions" (
    "ip" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSessions_deviceId_key" ON "DeviceSessions"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_deviceSessionsId_key" ON "Token"("deviceSessionsId");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_deviceSessionsId_fkey" FOREIGN KEY ("deviceSessionsId") REFERENCES "DeviceSessions"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSessions" ADD CONSTRAINT "DeviceSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
