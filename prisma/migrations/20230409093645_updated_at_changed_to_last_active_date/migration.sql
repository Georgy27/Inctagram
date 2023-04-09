/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `DeviceSession` table. All the data in the column will be lost.
  - Added the required column `lastActiveDate` to the `DeviceSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceSession" DROP COLUMN "updatedAt",
ADD COLUMN     "lastActiveDate" TIMESTAMP(3) NOT NULL;
