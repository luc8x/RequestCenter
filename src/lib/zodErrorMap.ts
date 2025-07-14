import { ZodErrorMap, ZodIssueCode } from "zod";
import pt from "@/locales/pt-zod.json";

export const customZodErrorMap: ZodErrorMap = (issue, ctx) => {
  const t = pt.errors;
  const fallback = ctx?.defaultError ?? "Erro de validação";

  switch (issue.code) {
    case ZodIssueCode.invalid_type: {
      if (issue.received === undefined || issue.received === null) {
        return { message: t.invalid_type_received_undefined || fallback };
      }
      return {
        message:
          t.invalid_type
            ?.replace("{{expected}}", String(issue.expected))
            ?.replace("{{received}}", String(issue.received)) || fallback,
      };
    }

    case "invalid_format": {
      const format = issue.format || "";
      const msg = t.invalid_format || `Formato inválido: ${format}`;
      return { message: msg };
    }

    case ZodIssueCode.invalid_string: {
      const msg = issue.validation ? t.invalid_string?.[issue.validation] : undefined;
      return { message: msg || fallback };
    }

    case ZodIssueCode.too_small: {
      const path = t.too_small?.[issue.type]?.inclusive;
      const msg = path ? path.replace("{{minimum}}", String(issue.minimum)) : undefined;
      return { message: msg || fallback };
    }

    case ZodIssueCode.too_big: {
      const path = t.too_big?.[issue.type]?.inclusive;
      const msg = path ? path.replace("{{maximum}}", String(issue.maximum)) : undefined;
      return { message: msg || fallback };
    }

    case ZodIssueCode.custom: {
      return { message: t.custom || fallback };
    }

    default: {
      const generic = t[issue.code as keyof typeof t];
      return { message: generic || fallback };
    }
  }
};
