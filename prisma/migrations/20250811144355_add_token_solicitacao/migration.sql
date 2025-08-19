/*
  Warnings:

  - Added the required column `token` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "token" TEXT NOT NULL;
