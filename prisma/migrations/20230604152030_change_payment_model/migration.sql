/*
  Warnings:

  - The values [SUBSCRIPTION] on the enum `PaymentReference` will be removed. If these variants are still used in the database, this will fail.
  - The values [YEAR] on the enum `PeriodType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentReference_new" AS ENUM ('RENEW', 'ONETIME');
ALTER TABLE "Payment" ALTER COLUMN "reference" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "reference" TYPE "PaymentReference_new" USING ("reference"::text::"PaymentReference_new");
ALTER TYPE "PaymentReference" RENAME TO "PaymentReference_old";
ALTER TYPE "PaymentReference_new" RENAME TO "PaymentReference";
DROP TYPE "PaymentReference_old";
ALTER TABLE "Payment" ALTER COLUMN "reference" SET DEFAULT 'ONETIME';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PeriodType_new" AS ENUM ('DAY', 'WEEK', 'MONTH');
ALTER TYPE "PeriodType" RENAME TO "PeriodType_old";
ALTER TYPE "PeriodType_new" RENAME TO "PeriodType";
DROP TYPE "PeriodType_old";
COMMIT;
