/*
  Warnings:

  - The values [EM_ANDAMENTO] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('ABERTA', 'EM_ATENDIMENTO', 'FINALIZADA', 'CANCELADA');
ALTER TABLE "Solicitacao" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Solicitacao" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "Solicitacao" ALTER COLUMN "status" SET DEFAULT 'ABERTA';
COMMIT;
