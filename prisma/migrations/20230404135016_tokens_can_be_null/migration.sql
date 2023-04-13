-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "accessTokenHash" DROP NOT NULL,
ALTER COLUMN "refreshTokenHash" DROP NOT NULL;
