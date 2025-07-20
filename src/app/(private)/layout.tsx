import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "../globals.css";

// componentes
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Toaster } from "sonner";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#242426" }}
      >
        <Toaster />
        <SidebarProvider>
          <AppSidebar />
          <main className="p-5 w-full flex flex-col gap-5">
            <div className="mb-2 p-1 px-2 bg-black/30 rounded-2xl flex gap-2 items-center">
              <SidebarTrigger className="text-green-600" />
              <span className="text-white">|</span>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-green-600">Início</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Providers>{children}</Providers>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
