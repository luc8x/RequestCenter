import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id: paramId } = await params;
  const solicitacaoId = Number(paramId);

  try {
    const solicitacao = await prisma.solicitacao.update({
      where: { id: solicitacaoId },
      data: {
        atendenteId: session.user.id,
        status: "EM_ATENDIMENTO",
      },
    });

    return NextResponse.json(solicitacao, { status: 200 });
  } catch (error) {
    console.error("Erro ao atender solicitação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
