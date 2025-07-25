-- CreateEnum
CREATE TYPE "Permissao" AS ENUM ('SOLICITANTE', 'ATENDENTE');

-- AlterEnum
ALTER TYPE "Prioridade" ADD VALUE 'NAO_INFORMADA';

-- AlterTable


-- AlterTable
ALTER TABLE "User" ADD COLUMN     "permissao" "Permissao" NOT NULL DEFAULT 'SOLICITANTE';
