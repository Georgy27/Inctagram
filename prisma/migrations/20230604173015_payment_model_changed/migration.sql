/*
  Warnings:

  - You are about to drop the column `currency` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `priceId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "currency",
DROP COLUMN "price",
ADD COLUMN     "priceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
