/*
  Warnings:

  - The values [OTHER] on the enum `PaymentReference` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `info` on the `SubscriptionPayment` table. All the data in the column will be lost.
  - Added the required column `periodType` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAY', 'MONTH', 'YEAR');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentReference_new" AS ENUM ('SUBSCRIPTION', 'ONETIME');
ALTER TABLE "Payment" ALTER COLUMN "reference" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "reference" TYPE "PaymentReference_new" USING ("reference"::text::"PaymentReference_new");
ALTER TYPE "PaymentReference" RENAME TO "PaymentReference_old";
ALTER TYPE "PaymentReference_new" RENAME TO "PaymentReference";
DROP TYPE "PaymentReference_old";
ALTER TABLE "Payment" ALTER COLUMN "reference" SET DEFAULT 'ONETIME';
COMMIT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "info" JSONB,
ALTER COLUMN "reference" SET DEFAULT 'ONETIME';

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "periodType" "PeriodType" NOT NULL;

-- AlterTable
ALTER TABLE "SubscriptionPayment" DROP COLUMN "info";
