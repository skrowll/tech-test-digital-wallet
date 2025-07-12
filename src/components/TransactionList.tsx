'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Account {
  id: string;
  user?: User;
}

interface Transaction {
  id: string;
  amount: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'REVERSAL';
  description?: string;
  createdAt: string;
  account: Account;
  senderAccount?: Account;
  receiverAccount?: Account;
  reversedTransactionId?: string | null;
  reversedTransaction?: Transaction | null;
}

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => {
  if (!res.ok) throw new Error('Falha ao carregar transações');
  return res.json();
});

export default function TransactionList() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { 
    data: transactions, 
    error, 
    isLoading,
    mutate 
  } = useSWR<Transaction[]>(userId ? '/api/transactions' : null, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const formatCurrency = (value: string) => {
    const amount = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const reverseTransaction = async (transactionId: string) => {
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

      mutate();
      alert('Transação estornada com sucesso!');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message || 'Erro ao estornar transação');
      } else {
        alert('Erro ao estornar transação');
      }
    }
  };

  const canReverseTransaction = (transaction: Transaction) => {
    if (transaction.type === 'REVERSAL') return false;
    if (transaction.reversedTransactionId) return false;
    
    const isSender = transaction.senderAccount?.user?.id === userId;
    const isAccountOwner = transaction.account.user?.id === userId;
    
    return isSender || isAccountOwner;
  };

  const getTransactionDetails = (transaction: Transaction) => {
    if (!userId) return { description: '', amount: '', sign: '' };

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
          const receiverName = transaction.receiverAccount?.user 
            ? `${transaction.receiverAccount.user.firstName} ${transaction.receiverAccount.user.lastName}`
            : 'Usuário desconhecido';
          
          return {
            description: `Transferência para ${receiverName}`,
            amount: `- ${formatCurrency(transaction.amount)}`,
            sign: 'negative',
          };
        }

        if (isReceiver) {
          const senderName = transaction.senderAccount?.user 
            ? `${transaction.senderAccount.user.firstName} ${transaction.senderAccount.user.lastName}`
            : 'Usuário desconhecido';
          
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
    return <div className="p-4 text-center">Carregando transações...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Erro ao carregar transações</p>
        <button 
          onClick={() => mutate()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>Nenhuma transação encontrada</p>
        <button 
          onClick={() => mutate()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Recarregar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Histórico de Transações</h1>
        <button 
          onClick={() => mutate()} 
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
        >
          Atualizar
        </button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const { description, amount, sign } = getTransactionDetails(transaction);
          const date = new Date(transaction.createdAt).toLocaleString('pt-BR');
          const canReverse = canReverseTransaction(transaction);
          const isReversed = !!transaction.reversedTransactionId;
          
          return (
            <div
              key={transaction.id}
              className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                isReversed ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">{description}</h3>
                    {isReversed && (
                      <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        Estornada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {date} | ID: {transaction.id}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <span
                    className={`text-lg font-semibold ${
                      sign === 'positive'
                        ? 'text-green-600'
                        : sign === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {amount}
                  </span>
                  
                  {canReverse && (
                    <button
                      onClick={() => reverseTransaction(transaction.id)}
                      className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm transition-colors"
                    >
                      Estornar
                    </button>
                  )}
                </div>
              </div>
              
              {transaction.description && (
                <p className="mt-2 text-gray-600">{transaction.description}</p>
              )}
              
              {transaction.reversedTransaction && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Estornada em: {new Date(transaction.reversedTransaction.createdAt).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm">
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