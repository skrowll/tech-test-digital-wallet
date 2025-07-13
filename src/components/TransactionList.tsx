'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { showToast } from '@/lib/toast';
import type { User, Transaction, TransactionDetails } from '@/types';

const fetcher = async (url: string): Promise<Transaction[]> => {
  const response = await fetch(url, { credentials: 'include' });
  
  if (!response.ok) {
    throw new Error('Falha ao carregar transações');
  }
  
  return response.json();
};

export default function TransactionList() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { 
    data: transactions, 
    error, 
    isLoading,
    mutate 
  } = useSWR<Transaction[]>(
    userId ? '/api/transactions' : null, 
    fetcher, 
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  const formatCurrency = (value: string): string => {
    const amount = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (user?: User): string => {
    if (!user) return 'Usuário desconhecido';
    return `${user.firstName} ${user.lastName}`;
  };

  const reverseTransaction = async (transactionId: string): Promise<void> => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/transactions/${transactionId}/reversal`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao estornar transação');
      }

      await mutate();
      showToast.success('Transação estornada com sucesso!');
    } catch (error) {
      console.error('Erro ao estornar transação:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao estornar transação';
      showToast.error(errorMessage);
    }
  };

  const canReverseTransaction = (transaction: Transaction): boolean => {
    if (transaction.type === 'REVERSAL') return false;
    if (transaction.reversedTransactionId) return false;
    
    const isSender = transaction.senderAccount?.user?.id === userId;
    const isAccountOwner = transaction.account.user?.id === userId;
    
    return isSender || isAccountOwner;
  };

  const getTransactionDetails = (transaction: Transaction): TransactionDetails => {
    if (!userId) {
      return { 
        description: '', 
        amount: '', 
        sign: 'neutral' 
      };
    }

    switch (transaction.type) {
      case 'DEPOSIT':
        return {
          description: 'Depósito',
          amount: `+ ${formatCurrency(transaction.amount)}`,
          sign: 'positive',
        };

      case 'WITHDRAW':
        return {
          description: 'Saque',
          amount: `- ${formatCurrency(transaction.amount)}`,
          sign: 'negative',
        };

      case 'TRANSFER':
        const isSender = transaction.senderAccount?.user?.id === userId;
        const isReceiver = transaction.receiverAccount?.user?.id === userId;

        if (isSender) {
          const receiverName = getUserName(transaction.receiverAccount?.user);
          return {
            description: `Transferência para ${receiverName}`,
            amount: `- ${formatCurrency(transaction.amount)}`,
            sign: 'negative',
          };
        }

        if (isReceiver) {
          const senderName = getUserName(transaction.senderAccount?.user);
          return {
            description: `Transferência de ${senderName}`,
            amount: `+ ${formatCurrency(transaction.amount)}`,
            sign: 'positive',
          };
        }

        return {
          description: 'Transferência',
          amount: formatCurrency(transaction.amount),
          sign: 'neutral',
        };

      case 'REVERSAL':
        return {
          description: transaction.description || 'Reversão',
          amount: formatCurrency(transaction.amount),
          sign: 'neutral',
        };

      default:
        return {
          description: transaction.description || 'Transação',
          amount: formatCurrency(transaction.amount),
          sign: 'neutral',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400 dark:text-gray-600">
        <div className="animate-pulse">Carregando transações...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 dark:text-red-600 mb-2">Erro ao carregar transações</p>
        <button 
          onClick={() => mutate()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400 dark:text-gray-600 mb-2">Nenhuma transação encontrada</p>
        <button 
          onClick={() => mutate()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Recarregar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-gray-900">Histórico de Transações</h1>
        <button 
          onClick={() => mutate()} 
          className="px-3 py-1 bg-[#262626] border border-[#3a3a3a] text-gray-300 rounded-md hover:bg-[#3a3a3a] text-sm transition-colors cursor-pointer dark:bg-gray-200 dark:border-gray-300 dark:text-gray-700 dark:hover:bg-gray-300 self-start sm:self-auto"
        >
          Atualizar
        </button>
      </div>
      
      <div className="space-y-4 overflow-x-hidden">
        {transactions.map((transaction) => {
          const { description, amount, sign } = getTransactionDetails(transaction);
          const formattedDate = formatDate(transaction.createdAt);
          const canReverse = canReverseTransaction(transaction);
          const isReversed = !!transaction.reversedTransactionId;
          
          return (
            <div
              key={transaction.id}
              className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow w-full overflow-x-hidden ${
                isReversed 
                  ? 'bg-[#1a1a1a]/50 border-[#2a2a2a] dark:bg-gray-50 dark:border-gray-300' 
                  : 'bg-[#1a1a1a] border-[#2a2a2a] dark:bg-white dark:border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0 overflow-x-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-1 gap-2">
                    <h3 className="font-medium text-white dark:text-gray-900 break-words">{description}</h3>
                    {isReversed && (
                      <span className="bg-gray-600/20 border border-gray-500/30 text-gray-400 text-xs px-2 py-1 rounded-full dark:bg-gray-200 dark:border-gray-300 dark:text-gray-700 self-start">
                        Estornada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {formattedDate}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">
                    ID: {transaction.id}
                  </p>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span
                    className={`text-lg font-semibold ${
                      sign === 'positive'
                        ? 'text-green-400 dark:text-green-600'
                        : sign === 'negative'
                        ? 'text-red-400 dark:text-red-600'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {amount}
                  </span>
                  
                  {canReverse && (
                    <button
                      onClick={() => reverseTransaction(transaction.id)}
                      className="px-3 py-1 bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 rounded-md hover:bg-yellow-900/30 text-sm transition-colors cursor-pointer dark:bg-yellow-100 dark:border-yellow-300 dark:text-yellow-700 dark:hover:bg-yellow-200"
                    >
                      Estornar
                    </button>
                  )}
                </div>
              </div>
              
              {transaction.description && transaction.description !== description && (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-600 border-t border-[#2a2a2a] dark:border-gray-200 pt-2 break-words">
                  {transaction.description}
                </p>
              )}
              
              {transaction.reversedTransaction && (
                <div className="mt-2 pt-2 border-t border-[#2a2a2a] dark:border-gray-200 overflow-x-hidden">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Estornada em: {formatDate(transaction.reversedTransaction.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                    ID da reversão: {transaction.reversedTransaction.id}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}