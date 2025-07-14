import { customZodErrorMap } from "@/lib/zodErrorMap";
import { z } from "zod"

z.setErrorMap(customZodErrorMap);

export const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido. Verifique o formato (ex: nome@dominio.com)" }),
  password: z.string().min(6),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(3).refine((val) => !/\d/.test(val), {
      message: "O nome não pode conter números.",
    }).refine((val) => {
    const palavras = val
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((p) => !["da", "de", "do", "dos", "das", "e", "van", "von", "del", "la", "le"].includes(p));
    return palavras.length >= 2;
  }, {
    message: "Informe pelo menos o nome e sobrenome.",
  }).refine((val) => {
    const partes = val.trim().split(/\s+/);
    return partes.every((palavra) => {
      if (["da", "de", "do", "dos", "das", "e", "van", "von", "del", "la", "le"].includes(palavra.toLowerCase())) {
        return true; 
      }
      return /^[A-Z][a-zÀ-ÿ]+$/.test(palavra);
    });
  }, {
    message: "As inicias devem está em maiúsculas.",
  }),
})