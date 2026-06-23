-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "status" "product_status" NOT NULL DEFAULT 'DRAFT';
