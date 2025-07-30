"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function InicioPage() {
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());

  // Atualiza horário a cada minuto para saudação dinâmica
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
      <section
        className="bg-gray-800 rounded-xl p-8 shadow-xl transform transition-all duration-700 ease-in-out opacity-0 animate-fadeInUp"
        style={{ animationFillMode: "forwards" }}
      >
        <h1 className="text-2xl font-extrabold mb-4 text-blue-400 tracking-wide">
          Seja bem vindo, {(session?.user?.name?.split(" ")[0] ?? "Usuário")}!
        </h1>
        <p className="text-gray-300 mb-6">
          Estamos na data <time dateTime={time.toISOString()}>{time.toLocaleDateString()}</time> e horário{" "}
          <time>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>.
        </p>
        <div className="p-4 rounded-lg bg-gray-700 border border-blue-600">
          <a href="/solicitacao" className="text-center text-blue-300 font-medium">
            Sessão ativa. Aproveite o dashboard e otimize suas demandas com eficiência.
          </a>
        </div>
      </section>
  );
}
