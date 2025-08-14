import { NextResponse } from "next/server";
import { registerSchema } from "@/schemas/authSchema";
import { hashPassword } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const parse = registerSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ errors: parse.error.flatten() }, { status: 400 });
  }

  const { name, email, password, permissao } = parse.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      permissao: permissao,
    },
  });

  return NextResponse.json({ message: "Usuário cadastrado com sucesso" }, { status: 201 });
}