"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: accounts, error, isLoading } = useSWR(
    "/api/accounts",
    fetcher
  );

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Olá, {user.name}!
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo à sua conta</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Informações da Conta</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.name && (
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Suas Contas</h3>
              
              {isLoading && (
                <p className="text-gray-500">Carregando contas...</p>
              )}

              {error && (
                <p className="text-red-500">Erro ao carregar contas: {error.message}</p>
              )}

              {accounts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map((account: { id: string; balance: number; createdAt: string }) => (
                    <div key={account.id} className="border p-4 rounded-lg">
                      <h4 className="font-medium">Conta: {account.id.slice(0, 8)}...</h4>
                      <p className="mt-2">
                        Saldo: R$ {account.balance.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}