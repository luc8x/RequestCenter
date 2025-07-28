"use client";

import { useSession } from "next-auth/react";
import React from "react";

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center text-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full border-4 border-t-blue-400 border-gray-700 w-12 h-12"></div>
          <p className="text-gray-400 text-sm">Carregando sessão...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
