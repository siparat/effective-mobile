-- AlterTable
ALTER TABLE "Appeal" ADD COLUMN     "dateCancellation" TIMESTAMP(3),
ADD COLUMN     "reasonForCancellation" TEXT;
