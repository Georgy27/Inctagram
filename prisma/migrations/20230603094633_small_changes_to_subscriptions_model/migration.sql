/*
  Warnings:

  - You are about to drop the column `subscriptionPaymentId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `SubscriptionPayment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pricingTarrifId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_subscriptionPaymentId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_pricingTarrifId_fkey";

-- DropIndex
DROP INDEX "Subscription_subscriptionPaymentId_key";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "pricingTarrifId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "subscriptionPaymentId";

-- DropTable
DROP TABLE "SubscriptionPayment";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pricingTarrifId_fkey" FOREIGN KEY ("pricingTarrifId") REFERENCES "PricingTarrifs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
