"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import useSWR, { mutate } from "swr";
import DepositForm from "@/components/DepositForm";
import TransferForm from "@/components/TransferForm";
import WithdrawForm from "@/components/WithdrawForm";
import TransactionList from "@/components/TransactionList";
import BalanceCard from "@/components/BalanceCard";
import TransactionCards from "@/components/TransactionCards";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { TransactionSummary } from "@/types";
import { showToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/currency-mask";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: accounts, error, isLoading } = useSWR("/api/accounts", fetcher);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [transactionPanel, setTransactionPanel] = useState<{
    isOpen: boolean;
    type: "deposit" | "withdraw" | "transfer" | null;
  }>({
    isOpen: false,
    type: null,
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    transaction: TransactionSummary | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    transaction: null,
    isLoading: false,
  });

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleTransactionClick = (type: "deposit" | "withdraw" | "transfer") => {
    setTransactionPanel({
      isOpen: true,
      type: type,
    });
  };

  const closeTransactionPanel = () => {
    setTransactionPanel({
      isOpen: false,
      type: null,
    });
  };

  const handleTransactionSuccess = () => {
    closeTransactionPanel();
    setConfirmationModal({
      isOpen: false,
      transaction: null,
      isLoading: false,
    });
  };

  const handleShowConfirmation = (transaction: TransactionSummary) => {
    setConfirmationModal({
      isOpen: true,
      transaction,
      isLoading: false,
    });
  };

  const handleConfirmTransaction = async () => {
    if (!confirmationModal.transaction) return;

    setConfirmationModal(prev => ({ ...prev, isLoading: true }));

    try {
      const transaction = confirmationModal.transaction;
      let response;

      if (transaction.type === 'deposit') {
        response = await fetch('/api/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: accounts?.[0]?.id,
            amount: transaction.amount,
            ...(transaction.description && { description: transaction.description })
          }),
        });
      } else if (transaction.type === 'withdraw') {
        response = await fetch('/api/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: accounts?.[0]?.id,
            amount: transaction.amount,
            ...(transaction.description && { description: transaction.description })
          }),
        });
      } else if (transaction.type === 'transfer') {
        response = await fetch('/api/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceAccountId: accounts?.[0]?.id,
            targetEmail: transaction.targetEmail,
            amount: transaction.amount,
            ...(transaction.description && { description: transaction.description })
          }),
        });
      }

      if (response?.ok) {        
        // Mostrar notificação de sucesso
        const transactionTypeText = transaction.type === 'deposit' ? 'Depósito' : 
                                  transaction.type === 'withdraw' ? 'Saque' : 'Transferência';
        showToast.success(`${transactionTypeText} de R$ ${formatCurrency(transaction.amount)} realizado com sucesso!`);
        
        // Revalidar dados usando SWR sem recarregar a página
        await mutate('/api/accounts');
        await mutate('/api/transactions');
        
        // Fechar modal e painel
        handleTransactionSuccess();
      } else {
        const data = await response?.json();
        showToast.error(data?.error || 'Erro ao processar transação');
        setConfirmationModal(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Erro ao processar transação:', error);
      showToast.error('Falha na conexão com o servidor');
      setConfirmationModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCancelTransaction = () => {
    setConfirmationModal({
      isOpen: false,
      transaction: null,
      isLoading: false,
    });
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
    <div className="h-screen bg-[#0f0f0f] text-gray-200 dark:bg-white dark:text-gray-900 overflow-x-hidden flex flex-col">
      {/* Header */}
      <Header 
        user={user} 
        onMenuClick={handleSidebarToggle}
        showMenuButton={true}
      />
      
      {/* Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          user={user} 
          accounts={accounts || []} 
          isExpanded={sidebarExpanded}
          onToggle={handleSidebarToggle}
        />
        
        {/* Main Content */}
        <div className="flex-1 md:ml-0 min-w-0 overflow-y-auto md:overflow-hidden relative flex flex-col">
          <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col flex-1 min-h-0">
            {/* Card de Saldo */}
            {accounts && (
              <div className="mb-6">
                <BalanceCard accounts={accounts} />
              </div>
            )}

            {/* Cards de Transações */}
            <TransactionCards 
              onDepositClick={() => handleTransactionClick("deposit")}
              onWithdrawClick={() => handleTransactionClick("withdraw")}
              onTransferClick={() => handleTransactionClick("transfer")}
            />

            {/* Status de Carregamento e Erros */}
            {isLoading && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow p-4 sm:p-6 dark:bg-gray-100 dark:border-gray-300 mb-6">
                <p className="text-gray-400 dark:text-gray-600">Carregando contas...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl shadow p-4 sm:p-6 mb-6">
                <p className="text-red-400 dark:text-red-600">
                  Erro ao carregar contas: {error.message}
                </p>
              </div>
            )}

            {/* Lista de Transações */}
            <div className="flex-1 min-h-0">
              <TransactionList />
            </div>
          </main>
          
          {/* Transaction Panel Overlay */}
          {transactionPanel.isOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={closeTransactionPanel} />
          )}
          
          {/* Transaction Panel */}
          <div className={`fixed top-0 right-0 h-full w-96 bg-[#0f0f0f] dark:bg-white border-l border-[#2a2a2a] dark:border-gray-300 z-50 transform transition-transform duration-300 ${
            transactionPanel.isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white dark:text-gray-900">
                  {transactionPanel.type === "deposit" && "Fazer Depósito"}
                  {transactionPanel.type === "withdraw" && "Fazer Saque"}
                  {transactionPanel.type === "transfer" && "Fazer Transferência"}
                </h2>
                <button
                  onClick={closeTransactionPanel}
                  className="p-2 rounded-lg hover:bg-[#2a2a2a] dark:hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                </button>
              </div>
              
              {/* Transaction Forms */}
              {accounts && accounts.length > 0 && (
                <div>
                  {transactionPanel.type === "deposit" && (
                    <DepositForm 
                      accountId={accounts[0].id} 
                      onSuccess={handleTransactionSuccess}
                      onShowConfirmation={handleShowConfirmation}
                    />
                  )}
                  {transactionPanel.type === "withdraw" && (
                    <WithdrawForm 
                      accountId={accounts[0].id} 
                      onSuccess={handleTransactionSuccess}
                      onShowConfirmation={handleShowConfirmation}
                    />
                  )}
                  {transactionPanel.type === "transfer" && (
                    <TransferForm 
                      accountId={accounts[0].id} 
                      onSuccess={handleTransactionSuccess}
                      onShowConfirmation={handleShowConfirmation}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação Global */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        transaction={confirmationModal.transaction}
        onConfirm={handleConfirmTransaction}
        onCancel={handleCancelTransaction}
        isLoading={confirmationModal.isLoading}
      />
    </div>
  );
}
