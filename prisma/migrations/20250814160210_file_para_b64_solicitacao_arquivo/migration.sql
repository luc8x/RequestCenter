/*
  Warnings:

  - You are about to drop the column `arquivoUrl` on the `ArquivoSolicitacao` table. All the data in the column will be lost.
  - Added the required column `arquivoBase64` to the `ArquivoSolicitacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ArquivoSolicitacao" DROP COLUMN "arquivoUrl",
ADD COLUMN     "arquivoBase64" TEXT NOT NULL;
