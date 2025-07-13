"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import useSWR from "swr";
import DepositForm from "@/components/DepositForm";
import TransferForm from "@/components/TransferForm";
import WithdrawForm from "@/components/WithdrawForm";
import TransactionList from "@/components/TransactionList";
import type { Account } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: accounts, error, isLoading } = useSWR("/api/accounts", fetcher);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-gray-300 flex items-center justify-center dark:bg-white dark:text-gray-800">
        Carregando...
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 dark:bg-white dark:text-gray-900">
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow dark:bg-gray-100 dark:border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white dark:text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-400 dark:text-gray-600">Olá, {user.name}!</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow p-6 dark:bg-gray-100 dark:border-gray-300 dark:text-gray-900">
          <h2 className="text-xl font-semibold mb-4 text-white dark:text-gray-900">
            Bem-vindo à sua conta
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white dark:text-gray-900">Informações da Conta</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-600">Email</p>
                  <p className="font-medium text-white dark:text-gray-900">{user.email}</p>
                </div>
                {user.name && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-600">Nome</p>
                    <p className="font-medium text-white dark:text-gray-900">{user.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#2a2a2a] dark:border-gray-300">
              <h3 className="text-lg font-medium mb-4 text-white dark:text-gray-900">Suas Contas</h3>

              {isLoading && <p className="text-gray-400 dark:text-gray-600">Carregando contas...</p>}

              {error && (
                <p className="text-red-400 dark:text-red-600">
                  Erro ao carregar contas: {error.message}
                </p>
              )}

              {accounts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map((account: Account) => (
                    <div
                      key={account.id}
                      className="border border-[#3a3a3a] bg-[#262626] text-white p-4 rounded-lg shadow dark:bg-gray-200 dark:border-gray-300 dark:text-gray-900"
                    >
                      <h4 className="font-medium">Conta: {account.id.slice(0, 8)}...</h4>
                      <p className="mt-2">
                        Saldo: R$ {account.balance.toFixed(2)}
                      </p>
                      <DepositForm accountId={account.id} />
                      <WithdrawForm accountId={account.id} />
                      <TransferForm accountId={account.id} />
                    </div>
                  ))}
                </div>
              )}

              <div className="container mx-auto px-4">
                <TransactionList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
