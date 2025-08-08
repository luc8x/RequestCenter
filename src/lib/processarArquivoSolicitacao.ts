import path from "path";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processarArquivo(arquivo: File) {
  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const ext = path.extname(arquivo.name).replace(".", "");
  const nomeArquivo = `${uuid()}.${ext}`;
  const caminho = path.join(process.cwd(), "public", "uploads", "solicitacoes", nomeArquivo);
  await writeFile(caminho, buffer);
  const urlArquivo = `/uploads/solicitacoes/${nomeArquivo}`;
  const imageBase64 = buffer.toString("base64");

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    { text: "Você é um assistente especializado em inspeção de qualidade de produtos. Analise a imagem enviada, identifique possíveis defeitos, danos ou irregularidades no produto, e descreva-os de forma detalhada e em português. Se possível, sugira a possível causa do problema e se ele é estético ou funcional." },
    {
      inlineData: {
        mimeType: `image/${ext}`,
        data: imageBase64,
      },
    },
  ]);

  const resultado = result.response.text();

  return { nomeArquivo, urlArquivo, resultado };
}
