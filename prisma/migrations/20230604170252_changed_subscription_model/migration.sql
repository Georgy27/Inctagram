/*
  Warnings:

  - A unique constraint covering the columns `[priceId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `priceId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "priceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_priceId_key" ON "Subscription"("priceId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE CASCADE ON UPDATE CASCADE;
