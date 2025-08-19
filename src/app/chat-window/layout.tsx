'use client';

import '../globals.css';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export default function ChatWindowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-transparent overflow-hidden">
        <SessionProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </SessionProvider>
      </body>
    </html>
  );
}