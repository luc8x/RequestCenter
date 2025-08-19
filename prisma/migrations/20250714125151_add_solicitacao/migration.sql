/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "assunto" VARCHAR(255) NOT NULL,
    "descricao" TEXT NOT NULL,
    "prioridade" "Prioridade" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ABERTA',
    "userId" TEXT NOT NULL,
    "atendenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
