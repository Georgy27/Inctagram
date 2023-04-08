/*
  Warnings:

  - Made the column `accessTokenHash` on table `Token` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshTokenHash` on table `Token` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "accessTokenHash" SET NOT NULL,
ALTER COLUMN "refreshTokenHash" SET NOT NULL;
