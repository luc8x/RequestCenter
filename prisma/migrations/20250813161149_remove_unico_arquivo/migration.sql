/*
  Warnings:

  - You are about to drop the column `analiseIA` on the `Solicitacao` table. All the data in the column will be lost.
  - You are about to drop the column `arquivoNome` on the `Solicitacao` table. All the data in the column will be lost.
  - You are about to drop the column `arquivoUrl` on the `Solicitacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Solicitacao" DROP COLUMN "analiseIA",
DROP COLUMN "arquivoNome",
DROP COLUMN "arquivoUrl";
