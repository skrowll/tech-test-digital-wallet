import type { Metadata } from "next";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import SessionProvider from './SessionProvider';
import DynamicToastContainer from '@/components/DynamicToastContainer';
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen h-full">
        <SessionProvider session={session}>
          <div className="min-h-full flex flex-col">
            {children}
          </div>
          <DynamicToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}