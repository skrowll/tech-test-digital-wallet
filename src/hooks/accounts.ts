import useSWR, { mutate as swrMutate } from 'swr';
import { useState } from 'react';
import { fetcher, mutate } from '@/config/swr';
import type { Account } from '@/types';

// Hook para buscar contas usando SWR
export function useAccounts() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Account[]>(
    '/api/accounts',
    fetcher
  );

  return {
    data,
    loading: isLoading,
    error: error?.message || null,
    revalidate,
  };
}

// Hook para depósito com SWR mutate
export function useDeposit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deposit = async (data: { accountId: string; amount: number; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutate('/api/deposit', {
        method: 'POST',
        body: data
      });

      if (result.success) {
        // Invalidar cache das contas e transações usando SWR mutate
        await Promise.all([
          swrMutate('/api/accounts'),
          swrMutate('/api/transactions')
        ]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Erro no depósito');
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
    deposit,
    loading,
    error,
  };
}

// Hook para saque com SWR mutate
export function useWithdraw() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdraw = async (data: { accountId: string; amount: number; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutate('/api/withdraw', {
        method: 'POST',
        body: data
      });

      if (result.success) {
        // Invalidar cache das contas e transações usando SWR mutate
        await Promise.all([
          swrMutate('/api/accounts'),
          swrMutate('/api/transactions')
        ]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Erro no saque');
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
    withdraw,
    loading,
    error,
  };
}

// Hook para transferência com SWR mutate
export function useTransfer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = async (data: { sourceAccountId: string; targetEmail: string; amount: number; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutate('/api/transfer', {
        method: 'POST',
        body: data
      });

      if (result.success) {
        // Invalidar cache das contas e transações usando SWR mutate
        await Promise.all([
          swrMutate('/api/accounts'),
          swrMutate('/api/transactions')
        ]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Erro na transferência');
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
    transfer,
    loading,
    error,
  };
}
