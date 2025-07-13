"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

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
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 dark:bg-white dark:text-gray-900 overflow-x-hidden">
      {/* Header */}
      <Header 
        user={user} 
        onMenuClick={handleSidebarToggle}
        showMenuButton={true}
      />
      
      {/* Layout Container */}
      <div className="flex overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar 
          user={user} 
          accounts={accounts || []} 
          isExpanded={sidebarExpanded}
          onToggle={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <div className="flex-1 md:ml-0 min-w-0 overflow-x-hidden">
          <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow p-4 sm:p-6 dark:bg-gray-100 dark:border-gray-300 dark:text-gray-900 overflow-x-hidden">
          <h2 className="text-xl font-semibold mb-4 text-white dark:text-gray-900">
            Bem-vindo à sua conta
          </h2>

          <div className="space-y-4 overflow-x-hidden">
            <div>
              <h3 className="text-lg font-medium text-white dark:text-gray-900">Informações da Conta</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-600">Email</p>
                  <p className="font-medium text-white dark:text-gray-900 break-words">{user.email}</p>
                </div>
                {user.name && (
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-600">Nome</p>
                    <p className="font-medium text-white dark:text-gray-900 break-words">{user.name}</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-x-hidden">
                  {accounts.map((account: Account) => (
                    <div
                      key={account.id}
                      className="border border-[#3a3a3a] bg-[#262626] text-white p-4 rounded-lg shadow dark:bg-gray-200 dark:border-gray-300 dark:text-gray-900 min-w-0 overflow-x-hidden"
                    >
                      <h4 className="font-medium break-words">Conta: {account.id.slice(0, 8)}...</h4>
                      <p className="mt-2">
                        Saldo: R$ {account.balance.toFixed(2)}
                      </p>
                      <div className="space-y-2 mt-4">
                        <DepositForm accountId={account.id} />
                        <WithdrawForm accountId={account.id} />
                        <TransferForm accountId={account.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="container mx-auto px-0 overflow-x-hidden">
                <TransactionList />
              </div>
            </div>
          </div>
        </div>
        </main>
        </div>
      </div>
    </div>
  );
}
