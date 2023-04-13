/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Token` table. All the data in the column will be lost.
  - Added the required column `accessTokenHash` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshTokenHash` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "accessToken",
DROP COLUMN "refreshToken",
ADD COLUMN     "accessTokenHash" TEXT NOT NULL,
ADD COLUMN     "refreshTokenHash" TEXT NOT NULL;
