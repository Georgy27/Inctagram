-- CreateEnum
CREATE TYPE "OauthProvider" AS ENUM ('GITHUB', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OauthAccount" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" "OauthProvider" NOT NULL,
    "linked" BOOLEAN NOT NULL DEFAULT false,
    "mergeCode" TEXT,
    "mergeCodeExpDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "OauthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OauthAccount_clientId_type_key" ON "OauthAccount"("clientId", "type");

-- AddForeignKey
ALTER TABLE "OauthAccount" ADD CONSTRAINT "OauthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
