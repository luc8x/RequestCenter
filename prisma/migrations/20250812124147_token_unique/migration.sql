/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Solicitacao` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Solicitacao_token_key" ON "Solicitacao"("token");
