import { customZodErrorMap } from "@/lib/zodErrorMap";
import { z } from "zod"

z.setErrorMap(customZodErrorMap);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(3).refine((val) => !/\d/.test(val), {
      message: "O nome não pode conter números",
    }),
})