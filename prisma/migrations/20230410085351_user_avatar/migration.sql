/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `DeviceSession` table. All the data in the column will be lost.
  - Added the required column `lastActiveDate` to the `DeviceSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceSession" DROP COLUMN "updatedAt",
ADD COLUMN     "lastActiveDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "previewUrl" TEXT,
    "size" INTEGER,
    "height" INTEGER,
    "width" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_userId_key" ON "Avatar"("userId");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
