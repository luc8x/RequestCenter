import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Providers } from "@/lib/providers";
import "../globals.css";

// componentes
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar";
import { Conta } from "@/components/conta";
import { Toaster } from "sonner";
import { LoadingWrapper } from "@/components/LoadingWrapper";

export const metadata: Metadata = {
  title: "Request Center",
  description: "Request Center",
  icons: {
  }
};

export default async function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (session.user.permissao !== "SOLICITANTE") {
    return redirect("/403");
  }

  return (
    <html lang="pt-BR">
      <body className="bg-gray-900 antialiased">
        <LoadingWrapper>
          <SidebarProvider>
            <AppSidebar />
            <main className="p-5 w-full flex flex-col gap-4 bg-gradient-to-b from-gray-900 to-gray-800">
              <div className="p-1 px-4 rounded-2xl flex gap-2 items-center">
                <div className="flex justify-between w-full items-center">
                  <Conta />
                </div>
              </div>
              <Providers>{children}</Providers>
            </main>
          </SidebarProvider>
        </LoadingWrapper>
        <Toaster richColors />
      </body>
    </html>
  );
}
