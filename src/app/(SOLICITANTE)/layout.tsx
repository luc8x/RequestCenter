import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "../globals.css";

// componentes
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar";
import { Toaster } from "sonner";
import { Conta } from "@/components/conta";
import { LoadingWrapper } from "@/components/LoadingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Request Center",
  description: "Request Center",
  icons: {
  }
};

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-900 antialiased">
        <LoadingWrapper>
          {/* Conteúdo da aplicação aqui */}
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
      </body>
    </html>
  );
}
