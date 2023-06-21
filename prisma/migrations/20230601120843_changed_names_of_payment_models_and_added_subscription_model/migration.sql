/*
  Warnings:

  - You are about to drop the column `description` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `subscription` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `tarrifId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `PricingTarrifs` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionType` to the `PricingTarrifs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('ONETIME', 'RECCURING');

-- CreateEnum
CREATE TYPE "PaymentReference" AS ENUM ('SUBSCRIPTION', 'OTHER');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_tarrifId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropIndex
DROP INDEX "Payment_subscription_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "description",
DROP COLUMN "expirationDate",
DROP COLUMN "subscription",
DROP COLUMN "tarrifId",
ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL,
ADD COLUMN     "reference" "PaymentReference" NOT NULL DEFAULT 'SUBSCRIPTION';

-- AlterTable
ALTER TABLE "PricingTarrifs" DROP COLUMN "paymentType",
ADD COLUMN     "subscriptionType" "SubscriptionType" NOT NULL;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "endDate" TIMESTAMPTZ(3),
    "startDate" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedSubscription" TEXT,
    "status" "SubscriptionStatus" NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionPaymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "id" TEXT NOT NULL,
    "info" JSONB,
    "paymentId" TEXT NOT NULL,
    "pricingTarrifId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionPaymentId_key" ON "Subscription"("subscriptionPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_paymentId_key" ON "SubscriptionPayment"("paymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriptionPaymentId_fkey" FOREIGN KEY ("subscriptionPaymentId") REFERENCES "SubscriptionPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_pricingTarrifId_fkey" FOREIGN KEY ("pricingTarrifId") REFERENCES "PricingTarrifs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
