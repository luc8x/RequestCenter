import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "../globals.css";

// componentes
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";
import { Conta } from "@/components/conta";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Painel - Request Center",
  description: "Request Center",
  icons: {
  }
};

export default function RootDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster />
        <SidebarProvider>
          <AppSidebar />
          <main className="p-5 w-full flex flex-col gap-4" style={{ backgroundColor: "#000100" }}>
            <div className="p-1 px-4 rounded-2xl flex gap-2 items-center">
              <div className="flex justify-between w-full items-center">
                <Conta/>
              </div>
            </div>
            <Providers>{children}</Providers>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
