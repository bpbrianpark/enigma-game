/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Entry` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Entry_url_key" ON "public"."Entry"("url");
