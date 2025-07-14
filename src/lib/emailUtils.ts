import { promises as dns } from "dns";

export async function dominioEmailExiste(email: string): Promise<boolean> {
  const dominio = email.split("@")[1];
  try {
    const registros = await dns.resolveMx(dominio);
    return registros.length > 0;
  } catch {
    return false;
  }
}