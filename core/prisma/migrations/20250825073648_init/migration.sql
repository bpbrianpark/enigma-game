/*
  Warnings:

  - Added the required column `limit` to the `Difficulty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Difficulty" ADD COLUMN     "limit" INTEGER NOT NULL;
