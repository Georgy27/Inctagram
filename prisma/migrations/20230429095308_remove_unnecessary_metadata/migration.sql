/*
  Warnings:

  - You are about to drop the column `filters` on the `ImageMetadata` table. All the data in the column will be lost.
  - You are about to drop the column `ratio` on the `ImageMetadata` table. All the data in the column will be lost.
  - You are about to drop the column `zoom` on the `ImageMetadata` table. All the data in the column will be lost.
  - You are about to drop the `ImageCropInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImageCropInfo" DROP CONSTRAINT "ImageCropInfo_metadataId_fkey";

-- AlterTable
ALTER TABLE "ImageMetadata" DROP COLUMN "filters",
DROP COLUMN "ratio",
DROP COLUMN "zoom";

-- DropTable
DROP TABLE "ImageCropInfo";

-- DropEnum
DROP TYPE "Ratio";
