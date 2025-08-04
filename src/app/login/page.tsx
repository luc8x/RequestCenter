"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/authSchema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

// Componentes UI
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Ícones
import { UserPlus, DoorOpen, LoaderCircle } from "lucide-react";
import ParticulasDotsBackground from "@/components/TSparticulasBackground";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: FormData) => {
    setError("");

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
    });

    if (res?.ok) {
      router.push("/inicio");
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <ParticulasDotsBackground />
      <section className="bg-white/10 backdrop-blur rounded-lg shadow-lg p-6 border border-blue-300 text-white w-full max-w-md">
        <header className="flex justify-between mb-4">
          <h1 className="text-3xl font-semibold">Login</h1>
          <a
            href="/registrar"
            className="text-sm flex gap-2 items-center hover:underline text-blue-300"
            aria-label="Cadastrar-se"
          >
            <UserPlus size={15} /> Cadastrar-se
          </a>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <fieldset className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="exemplo@exemplo.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-sm">
                {errors.email.message}
              </p>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Senha"
              required
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
            />
            {errors.password && (
              <p id="password-error" className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}
          </fieldset>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <fieldset className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Lembre-se de mim</Label>
          </fieldset>

          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
            className="w-full btn btn-primary flex justify-center items-center gap-2"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" /> Logando...
              </>
            ) : (
              <>
                <DoorOpen /> Logar
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-2">
          <hr className="flex-grow border-t border-white/30" />
          <span className="text-xs uppercase text-white/70">Ou continue com</span>
          <hr className="flex-grow border-t border-white/30" />
        </div>

        <div className="mt-5 flex justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={() => signIn("google")}
            aria-label="Continuar com Google"
          >
            <Image alt="Google" src="/google.png" width={20} height={20} />
            Google
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={() => signIn("github")}
            aria-label="Continuar com Github"
          >
            <Image alt="Github" src="/github.png" width={20} height={20} />
            Github
          </Button>
        </div>
      </section>
    </div>
  );
}
