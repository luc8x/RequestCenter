import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createSolicitacaoSchema } from "@/schemas/solicitacaoSchema";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parse = createSolicitacaoSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ errors: parse.error.flatten() }, { status: 400 });
  }

  const { assunto, descricao } = parse.data;

  const solicitacao = await prisma.solicitacao.create({
    data: {
      assunto,
      descricao,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ message: "Solicitação cadastrada com sucesso" }, { status: 201 });
}