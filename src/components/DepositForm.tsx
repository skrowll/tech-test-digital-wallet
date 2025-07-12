'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { showToast } from '@/lib/toast';
import type { DepositFormProps, DepositRequest } from '@/types';

export default function DepositForm({ accountId }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setAmount('');
  };

  const updateCache = () => {
    mutate('/api/accounts');
    mutate(`/api/accounts/${accountId}`);
    mutate('/api/transactions');
    mutate(`/api/transactions/${accountId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar valor
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        showToast.error('Valor deve ser maior que zero');
        return;
      }

      const requestData: DepositRequest = {
        accountId,
        amount: amountValue
      };

      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(`Depósito de R$ ${amountValue.toFixed(2)} realizado com sucesso!`);
        resetForm();
        updateCache();
      } else {
        showToast.error(data.error || 'Erro ao processar depósito');
      }
    } catch (error) {
      console.error('Erro ao processar depósito:', error);
      showToast.error('Falha na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow dark:bg-gray-100 dark:border-gray-300">
      <h3 className="font-semibold text-lg mb-3 text-white dark:text-gray-900">Depositar</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">
            Valor (R$)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full p-2 bg-[#262626] border border-[#3a3a3a] text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500"
            required
            step="0.01"
            min="0.01"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors dark:disabled:bg-gray-400"
        >
          {isLoading ? 'Processando...' : 'Depositar'}
        </button>
      </form>
    </div>
  );
}