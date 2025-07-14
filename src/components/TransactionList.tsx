'use client';

import { useSession } from 'next-auth/react';
import { showToast } from '@/utils/toast';
import { useTransactions, useReverseTransaction } from '@/hooks';
import type { Transaction } from '@/types';
import type { User, TransactionDetails } from '@/types';

export default function TransactionList() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // Hooks para operações
  const { data: transactions, loading: isLoading, error, revalidate: revalidateTransactions } = useTransactions();
  const { reverseTransaction: performReverse, loading: reverseLoading } = useReverseTransaction();

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
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

  const handleReverseTransaction = async (transactionId: string): Promise<void> => {
    if (!userId) return;

    try {
      const result = await performReverse(transactionId);

      if (result.success) {
        showToast.success('Transação estornada com sucesso!');
      } else {
        showToast.error(result.error || 'Erro ao estornar transação');
      }
    } catch (error) {
      console.error('Erro ao estornar transação:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao estornar transação';
      showToast.error(errorMessage);
    }
  };

  const canReverseTransaction = (transaction: Transaction): boolean => {
    // Apenas transferências podem ser estornadas (não REVERSAL, DEPOSIT ou WITHDRAW)
    if (transaction.type !== 'TRANSFER') {
      return false;
    }

    // Se a transação já foi estornada, não pode ser estornada novamente
    // Verificar se existe alguma transação de estorno que referencia esta transação
    if (transaction.reversingTransactions && transaction.reversingTransactions.length > 0) {
      return false;
    }

    // Para transferências, apenas o remetente pode estornar
    const isSender = transaction.senderAccount?.user?.id === userId;
    return isSender;
  };

  const isTransactionReversed = (transaction: Transaction): boolean => {
    return !!(transaction.reversingTransactions && transaction.reversingTransactions.length > 0);
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
          description: transaction.description || 'Depósito',
          amount: `+ ${formatCurrency(transaction.amount)}`,
          sign: 'positive',
        };

      case 'WITHDRAW':
        return {
          description: transaction.description || 'Saque',
          amount: `- ${formatCurrency(transaction.amount)}`,
          sign: 'negative',
        };

      case 'TRANSFER':
        const isSender = transaction.senderAccount?.user?.id === userId;
        const isReceiver = transaction.receiverAccount?.user?.id === userId;

        if (isSender) {
          const receiverName = getUserName(transaction.receiverAccount?.user);
          const baseDescription = transaction.description || 'Transferência';
          return {
            description: `${baseDescription} para ${receiverName}`,
            amount: `- ${formatCurrency(transaction.amount)}`,
            sign: 'negative',
          };
        }

        if (isReceiver) {
          const senderName = getUserName(transaction.senderAccount?.user);
          const baseDescription = transaction.description || 'Transferência';
          return {
            description: `${baseDescription} de ${senderName}`,
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
        const isReversalSender = transaction.senderAccount?.user?.id === userId;
        const isReversalReceiver = transaction.receiverAccount?.user?.id === userId;

        if (isReversalSender) {
          const receiverName = getUserName(transaction.receiverAccount?.user);
          const baseDescription = transaction.description || 'Estorno';
          return {
            description: `${baseDescription} para ${receiverName}`,
            amount: `- ${formatCurrency(transaction.amount)}`,
            sign: 'negative',
          };
        }

        if (isReversalReceiver) {
          const senderName = getUserName(transaction.senderAccount?.user);
          const baseDescription = transaction.description || 'Estorno';
          return {
            description: `${baseDescription} de ${senderName}`,
            amount: `+ ${formatCurrency(transaction.amount)}`,
            sign: 'positive',
          };
        }

        return {
          description: 'Estorno',
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
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg dark:from-gray-100 dark:to-gray-50 dark:border-gray-300 flex flex-col h-full min-h-[400px] md:min-h-[400px] max-h-none md:max-h-none">
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center text-gray-400 dark:text-gray-600">
            <div className="animate-pulse">Carregando transações...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg dark:from-gray-100 dark:to-gray-50 dark:border-gray-300 flex flex-col h-full min-h-[400px] md:min-h-[400px] max-h-none md:max-h-none">
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center">
            <p className="text-red-400 dark:text-red-600 mb-4">Erro ao carregar transações</p>
            <button 
              onClick={() => revalidateTransactions()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg dark:from-gray-100 dark:to-gray-50 dark:border-gray-300 flex flex-col h-full min-h-[400px] md:min-h-[400px] max-h-none md:max-h-none">
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center">
            <p className="text-gray-400 dark:text-gray-600 mb-4">Nenhuma transação encontrada</p>
            <button 
              onClick={() => revalidateTransactions()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg dark:from-gray-100 dark:to-gray-50 dark:border-gray-300 flex flex-col h-full min-h-[400px] md:min-h-[400px] max-h-none md:max-h-none">
      {/* Header do Card */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 pb-4 gap-4 border-b border-[#3a3a3a] dark:border-gray-300">
        <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-gray-900">
          Histórico de Transações
        </h1>
      </div>
      
      {/* Lista de Transações com Scroll */}
      <div className="flex-1 p-6 pt-4 overflow-y-auto transaction-scroll">
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const { description, amount, sign } = getTransactionDetails(transaction);
            const formattedDate = formatDate(transaction.createdAt);
            const canReverse = canReverseTransaction(transaction);
            const isReversed = isTransactionReversed(transaction);
            // Remover referências a propriedades que não existem no tipo do hook
            
            return (
              <div
                key={transaction.id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-[#0f0f0f] border-[#2a2a2a] dark:bg-white dark:border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-1 gap-2">
                      <h3 className="font-medium text-white dark:text-gray-900 break-words">{description}</h3>
                      {isReversed && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded-md dark:bg-gray-200 dark:border-gray-300 dark:text-gray-600">
                          Estornado
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
                        onClick={() => handleReverseTransaction(transaction.id)}
                        disabled={reverseLoading}
                        className="px-3 py-1 bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 rounded-md hover:bg-yellow-900/30 text-sm transition-colors cursor-pointer dark:bg-yellow-100 dark:border-yellow-300 dark:text-yellow-700 dark:hover:bg-yellow-200"
                      >
                        {reverseLoading ? 'Estornando...' : 'Estornar'}
                      </button>
                    )}
                  </div>
                </div>
                
                {transaction.description && transaction.description !== description && (
                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-600 border-t border-[#2a2a2a] dark:border-gray-200 pt-2 break-words">
                    {transaction.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}