'use client';

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export function Conta() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  const nome = session?.user?.name ?? "Usuário";
  const email = session?.user?.email ?? "sem@email.com";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted hover:text-black text-white transition-colors"
          aria-label="Abrir menu de conta"
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={session?.user?.image ?? "/avatar-placeholder.png"} />
            <AvatarFallback className="text-black">
              {nome?.[0] ?? "U"}
              {nome?.split(" ")?.[1]?.[0] ?? "S"}
            </AvatarFallback>
          </Avatar>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-medium truncate">{nome}</span>
            <span className="text-xs text-gray-400 truncate max-w-[180px]">{email}</span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-52 mt-2" align="end">
        <DropdownMenuLabel className="text-xs text-gray-500">Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-red-500 flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" color="#ff0000" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
