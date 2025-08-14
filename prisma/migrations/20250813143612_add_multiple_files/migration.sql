-- CreateTable
CREATE TABLE "ArquivoSolicitacao" (
    "id" SERIAL NOT NULL,
    "arquivoUrl" TEXT NOT NULL,
    "arquivoNome" TEXT NOT NULL,
    "analiseIA" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solicitacaoId" INTEGER NOT NULL,

    CONSTRAINT "ArquivoSolicitacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArquivoSolicitacao" ADD CONSTRAINT "ArquivoSolicitacao_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
