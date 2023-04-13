/*
  Warnings:

  - You are about to drop the column `userId` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deviceSessionId]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceSessionId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Made the column `accessTokenHash` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshTokenHash` on table `Token` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropIndex
DROP INDEX "Token_userId_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "userId",
ADD COLUMN     "deviceSessionId" TEXT NOT NULL,
ALTER COLUMN "accessTokenHash" SET NOT NULL,
ALTER COLUMN "refreshTokenHash" SET NOT NULL;

-- CreateTable
CREATE TABLE "DeviceSession" (
    "ip" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_deviceId_key" ON "DeviceSession"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_deviceSessionId_key" ON "Token"("deviceSessionId");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_deviceSessionId_fkey" FOREIGN KEY ("deviceSessionId") REFERENCES "DeviceSession"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
