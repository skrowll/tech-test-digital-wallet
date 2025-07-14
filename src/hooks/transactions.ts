import useSWR, { mutate as swrMutate } from 'swr';
import { useState } from 'react';
import { fetcher, mutate } from '@/config/swr';
import type { Transaction } from '@/types';

// Hook para buscar transações usando SWR
export function useTransactions() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Transaction[]>(
    '/api/transactions',
    fetcher
  );

  return {
    data,
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
}

// Hook para estorno de transação com SWR mutate
export function useReverseTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseTransaction = async (transactionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutate(`/api/transactions/${transactionId}/reversal`, {
        method: 'POST'
      });

      if (result.success) {
        // Invalidar cache das contas e transações usando SWR mutate
        await Promise.all([
          swrMutate('/api/accounts'),
          swrMutate('/api/transactions')
        ]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Erro no estorno');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de rede';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    reverseTransaction,
    loading,
    error,
  };
}
