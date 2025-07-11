import type { Metadata } from "next";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options'; // Importe do novo local
import SessionProvider from './SessionProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Wallet",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">
        <SessionProvider session={session}>
          <div className="min-h-full flex flex-col">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}